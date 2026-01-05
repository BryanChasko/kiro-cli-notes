// Test for tags functionality
describe('Tags Filter', () => {
  let mockData;
  
  beforeEach(() => {
    // Mock knowledge base data
    mockData = [
      {
        id: "1",
        content: "MCP integration guide",
        metadata: {
          title: "MCP Integration Guide",
          contentType: "Setup",
          tags: ["MCP", "Integration", "Setup"],
          source: "kiro-cli-docs"
        }
      },
      {
        id: "2",
        content: "Custom agents setup",
        metadata: {
          title: "Custom Agents Setup", 
          contentType: "Tutorial",
          tags: ["Agents", "Configuration", "Setup"],
          source: "kiro-cli-docs"
        }
      }
    ];
  });

  test('should extract unique tags from data', () => {
    const tags = new Set();
    
    mockData.forEach(chunk => {
      if (chunk.metadata && chunk.metadata.tags && Array.isArray(chunk.metadata.tags)) {
        chunk.metadata.tags.forEach(tag => tags.add(tag));
      }
    });
    
    const uniqueTags = Array.from(tags).sort();
    
    expect(uniqueTags).toEqual(["Agents", "Configuration", "Integration", "MCP", "Setup"]);
    expect(uniqueTags.length).toBe(5);
  });

  test('should populate tag filter dropdown', () => {
    // Create mock DOM element
    const tagFilter = document.createElement('select');
    tagFilter.id = 'tagFilter';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'All Tags';
    tagFilter.appendChild(defaultOption);
    
    // Extract tags
    const tags = new Set();
    mockData.forEach(chunk => {
      if (chunk.metadata && chunk.metadata.tags && Array.isArray(chunk.metadata.tags)) {
        chunk.metadata.tags.forEach(tag => tags.add(tag));
      }
    });
    
    // Populate dropdown
    Array.from(tags).sort().forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      tagFilter.appendChild(option);
    });
    
    // Test results
    expect(tagFilter.options.length).toBe(6); // 1 default + 5 tags
    expect(tagFilter.options[1].value).toBe('Agents');
    expect(tagFilter.options[1].textContent).toBe('Agents');
    expect(tagFilter.options[2].value).toBe('Configuration');
    expect(tagFilter.options[5].value).toBe('Setup');
  });
});

// Run the test
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mockData };
}
