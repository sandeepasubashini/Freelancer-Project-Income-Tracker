import mongoose from 'mongoose'

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('MONGODB_URI is missing. Add it to backend/.env.')
  }

  try {
    await mongoose.connect(uri)
  } catch (error) {
    if (error.message.includes('querySrv ECONNREFUSED')) {
      throw new Error(
        'MongoDB SRV DNS lookup was refused. Check your DNS/network settings or use a standard mongodb:// connection string.',
      )
    }

    const safeMessage = error.message.replace(
      /mongodb(?:\+srv)?:\/\/\S+/gi,
      '[MongoDB URI]',
    )
    throw new Error(`MongoDB connection failed: ${safeMessage}`)
  }

  mongoose.connection.on('error', (error) => {
    console.error(`MongoDB connection error: ${error.message}`)
  })
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB connection lost.')
  })

  console.log('MongoDB connected.')
}