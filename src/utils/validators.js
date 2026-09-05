export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const validatePassword = (password) => {
  if (password.length < 6) return 'Password must be at least 6 characters'
  return null
}

export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required'
  if (!/^\+?[\d\s\-()]{7,15}$/.test(phone)) return 'Invalid phone number'
  return null
}

export const validateRequired = (value, fieldName) => {
  if (!value || !value.toString().trim()) return `${fieldName} is required`
  return null
}

export const validatePrice = (price) => {
  const p = parseFloat(price)
  if (isNaN(p) || p < 0) return 'Price must be a valid positive number'
  return null
}

export const validateStock = (stock) => {
  const s = parseInt(stock)
  if (isNaN(s) || s < 0) return 'Stock must be a valid non-negative number'
  return null
}
