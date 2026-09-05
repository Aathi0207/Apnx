import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { cartService } from '../services/cartService'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) { setCartItems([]); return }
    setLoading(true)
    try {
      const items = await cartService.getCartItems(user.id)
      setCartItems(items || [])
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addToCart = async (productId, quantity = 1, stock = Infinity) => {
    if (!user) { toast.error('Please login to add items to cart'); return }
    const existing = cartItems.find(i => i.products?.id === productId)
    const currentQty = existing?.quantity || 0
    if (currentQty + quantity > stock) {
      toast.error('Not enough stock available')
      return
    }
    try {
      await cartService.addToCart(user.id, productId, quantity)
      await fetchCart()
      toast.success('Added to cart!')
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart')
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId)
      setCartItems(prev => prev.filter(i => i.id !== itemId))
    } catch (err) {
      toast.error(err.message || 'Failed to remove item')
    }
  }

  const updateQuantity = async (itemId, quantity, stock) => {
    if (quantity > stock) { toast.error('Not enough stock available'); return }
    try {
      await cartService.updateCartItemQuantity(itemId, quantity)
      if (quantity <= 0) {
        setCartItems(prev => prev.filter(i => i.id !== itemId))
      } else {
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i))
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update quantity')
    }
  }

  const clearCart = async () => {
    if (!user) return
    try {
      await cartService.clearCart(user.id)
      setCartItems([])
    } catch (err) {
      console.error('Failed to clear cart:', err)
    }
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = cartItems.reduce((sum, i) => {
    const price = i.products?.discount_price || i.products?.price || 0
    return sum + price * i.quantity
  }, 0)

  return (
    <CartContext.Provider value={{ cartItems, loading, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
