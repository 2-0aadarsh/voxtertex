const mongoose = require('mongoose');
const EnhancedPost = require('./src/models/enhancedPost.js').default;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voxvertex')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find posts with PDFs
    const posts = await EnhancedPost.find({
      'media.type': 'document',
      'media.url': { $regex: '\.pdf', $options: 'i' }
    }).limit(3);
    
    console.log('\n=== PDF POSTS FOUND ===');
    posts.forEach((post, index) => {
      console.log(`\nPost ${index + 1}:`);
      console.log('Title:', post.title);
      console.log('Media:');
      post.media.forEach((media, mediaIndex) => {
        if (media.type === 'document' && media.url.includes('.pdf')) {
          console.log(`  ${mediaIndex + 1}. URL: ${media.url}`);
          console.log(`     Filename: ${media.filename}`);
          console.log(`     Type: ${media.type}`);
        }
      });
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
