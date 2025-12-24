import app from './app.js';

const PORT = process.env.PORT || 8000;

// Start server
app.listen(PORT, () => {
    console.log(`🚀 KaizenHub API running at http://localhost:${PORT}`);
    console.log(`📚 API docs: http://localhost:${PORT}/api/health`);
});
