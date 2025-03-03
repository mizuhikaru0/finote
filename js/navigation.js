export function setupTabs() {
    const tabItems = document.querySelectorAll('.tabs ul li');
    const tabContents = document.querySelectorAll('.tab-content');
  
    tabItems.forEach(item => {
      item.addEventListener('click', function() {
        tabItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        tabContents.forEach(content => content.classList.remove('active'));
        const activeTab = document.getElementById(this.getAttribute('data-tab'));
        if (activeTab) activeTab.classList.add('active');
      });
    });
  }
  