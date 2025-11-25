// Vercel serverless function wrapper for Express app
// This wraps the Express app built in dist/index.js

// Import the Express app from the built bundle
// The app is exported from server/index.ts -> dist/index.js
let appHandler = null;

async function getAppHandler() {
  if (!appHandler) {
    try {
      // Import the built Express app module
      // Note: dist/index.js runs the server initialization code,
      // but also exports the app for serverless use
      const module = await import('../dist/index.js');
      
      // Check if app is exported
      if (module.app) {
        appHandler = module.app;
        console.log('[Vercel] Express app loaded successfully');
      } else {
        console.error('[Vercel] App not found in module exports:', Object.keys(module));
        throw new Error('Express app not exported from dist/index.js');
      }
    } catch (error) {
      console.error('[Vercel] Error loading Express app:', error);
      console.error('[Vercel] Error stack:', error.stack);
      throw error;
    }
  }
  return appHandler;
}

// Export default handler for Vercel
export default async function handler(req, res) {
  try {
    const app = await getAppHandler();
    // Use the Express app to handle the request
    return app(req, res);
  } catch (error) {
    console.error('[Vercel] Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}
