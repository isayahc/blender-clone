const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    
    try {
      const file = Bun.file(`./public${path}`);
      
      // Check if file exists
      if (await file.exists()) {
        return new Response(file);
      }
      
      // 404 for missing files
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  },
});

console.log(`🎨 Blender Clone running at http://localhost:${server.port}`);
