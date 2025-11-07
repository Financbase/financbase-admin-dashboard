// Assign unique featured images to blog posts based on their topics
// Using varied Unsplash images for different financial topics

const imageMap = {
  // Financial Planning & Strategy
  'financial-planning': [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=630&fit=crop'
  ],
  // Cash Flow & Money
  'cash-flow': [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1551288049-8c0c0c0c0c0c?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop'
  ],
  // Technology & AI
  'technology': [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=630&fit=crop'
  ],
  // Business & Strategy
  'business': [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=630&fit=crop',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=630&fit=crop'
  ]
};

// More varied Unsplash images for financial topics
const financialImages = [
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop', // Charts
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop', // Calculator
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop', // Analytics
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=630&fit=crop', // Business
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=630&fit=crop', // Money
  'https://images.unsplash.com/photo-1551288049-8c0c0c0c0c0c?w=1200&h=630&fit=crop', // Growth
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop', // AI/Tech
  'https://images.unsplash.com/photo-1551288049-8c0c0c0c0c0c?w=1200&h=630&fit=crop', // Strategy
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=630&fit=crop', // Planning
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop'  // Analysis
];

console.log('Image mapping created');
console.log('Total image variations:', financialImages.length);
