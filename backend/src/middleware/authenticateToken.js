import jwt from 'jsonwebtoken'

export function authenticateToken(request, response, next) {
  const authorization = request.get('authorization')
  const match = authorization?.match(/^Bearer\s+(\S+)$/i)

  if (!match) {
    return response.status(401).json({
      status: 'error',
      message: 'Authorization header with a valid access token is required.',
    })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return next(new Error('JWT_SECRET must be configured.'))
  }

  try {
    const payload = jwt.verify(match[1], secret)
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      return response.status(401).json({
        status: 'error',
        message: 'Invalid or expired token.',
      })
    }

    request.userId = payload.sub
    return next()
  } catch {
    return response.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
    })
  }
}
