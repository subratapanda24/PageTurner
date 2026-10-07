/**
 * BookHouse — Dashboard Application Logic
 * Matches the reference layout: Trending Books, Newly Added Books, Special Deals & Discounts table,
 * History, Favourites, Scheduled Drops (Live in 2 Days), search with categories, full auth, cart, orders, and reviews.
 */

const API = '/api';
let currentUser = null;
let authToken = null;
let authMode = 'login';
let selectedCategory = 'All';
let allBooks = [];
let pendingOrderData = null;

const categoriesList = ['All', 'Finance', 'Self-Help', 'Tech', 'Fantasy', 'Fiction', 'Mystery'];
let categoryIndex = 0;

// Curated books matching the exact BookHouse reference layout with verified local covers
const referenceMockBooks = {
  trending: [
    {
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      rating: 5.0,
      price: 399,
      cover: '/uploads/psychology-of-money.jpg',
      genre: 'Finance',
      description: 'Doing well with money isn’t necessarily about what you know. It’s about how you behave. Timeless lessons on wealth, greed, and happiness.'
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      rating: 4.9,
      price: 499,
      cover: '/uploads/atomic-habits.jpg',
      genre: 'Self-Help',
      description: 'An easy and proven way to build good habits and break bad ones. Small changes lead to remarkable results.'
    }
  ],
  newlyAdded: [
    {
      title: 'The Last Thing He Told Me',
      author: 'Laura Dave',
      cover: '/uploads/the-last-thing-he-told-me.jpg',
      price: 499,
      rating: 4.8,
      genre: 'Mystery',
      description: 'Before Owen Michaels disappears, he smuggles a note to his beloved wife of one year: Protect her.'
    },
    {
      title: 'False Witness: A Novel',
      author: 'Karin Slaughter',
      cover: '/uploads/false-witness.jpg',
      price: 450,
      rating: 4.5,
      genre: 'Fiction',
      description: 'Leigh Collier has worked hard to build a normal life. She is a defense attorney on the brink of making partner.'
    },
    {
      title: 'Malibu Rising',
      author: 'Taylor Jenkins Reid',
      cover: '/uploads/malibu-rising.jpg',
      price: 520,
      rating: 4.7,
      genre: 'Fiction',
      description: 'Four famous siblings throw an epic party to celebrate the end of the summer.'
    },
    {
      title: 'Left to Fear',
      author: 'Blake Pierce',
      cover: '/uploads/left-to-fear.jpg',
      price: 380,
      rating: 4.4,
      genre: 'Mystery',
      description: 'An FBI suspense thriller that follows Adele Sharp as she races across Europe to track down a killer.'
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      cover: '/uploads/great-gatsby.jpg',
      price: 299,
      rating: 4.7,
      genre: 'Fiction',
      description: 'The story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.'
    }
  ],
  history: [
    {
      title: 'Game of Thrones',
      author: 'George R.R. Martin',
      cover: '/uploads/game-of-thrones.jpg',
      price: 699,
      rating: 4.9,
      genre: 'Fantasy',
      description: 'A Song of Ice and Fire: Book One. Summer spans decades. Winter can last a lifetime.'
    },
    {
      title: 'Harry Potter',
      author: 'J.K. Rowling',
      cover: '/uploads/harry-potter.jpg',
      price: 599,
      rating: 4.9,
      genre: 'Fantasy',
      description: 'Harry Potter has never even heard of Hogwarts when letters start dropping on the doormat at number four, Privet Drive.'
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      cover: '/uploads/dune.jpg',
      price: 699,
      rating: 4.9,
      genre: 'Sci-Fi',
      description: 'Set on the desert planet Arrakis, Dune is the story of Paul Atreides and his journey to become the savior of mankind.'
    }
  ],
  favourites: [
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      cover: '/uploads/atomic-habits.jpg',
      price: 499,
      genre: 'Self-Help'
    },
    {
      title: 'Harry Potter',
      author: 'J.K. Rowling',
      cover: '/uploads/harry-potter.jpg',
      price: 599,
      genre: 'Fantasy'
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      cover: '/uploads/clean-code.jpg',
      price: 899,
      genre: 'Tech'
    },
    {
      title: 'The Last Thing He Told Me',
      author: 'Laura Dave',
      cover: '/uploads/the-last-thing-he-told-me.jpg',
      price: 499,
      genre: 'Mystery'
    }
  ],
  deals: [
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      offer: '30% OFF',
      dealPrice: 349,
      oldPrice: 499,
      cover: '/uploads/atomic-habits.jpg'
    },
    {
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      offer: '25% OFF',
      dealPrice: 299,
      oldPrice: 399,
      cover: '/uploads/psychology-of-money.jpg'
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      offer: '20% OFF',
      dealPrice: 719,
      oldPrice: 899,
      cover: '/uploads/clean-code.jpg'
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      offer: '25% OFF',
      dealPrice: 524,
      oldPrice: 699,
      cover: '/uploads/dune.jpg'
    }
  ],
  scheduledDrops: [
    {
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      rating: 5.0,
      price: 399,
      cover: '/uploads/psychology-of-money.jpg'
    },
    {
      title: 'The Last Thing He Told Me',
      author: 'Laura Dave',
      rating: 4.8,
      price: 499,
      cover: '/uploads/the-last-thing-he-told-me.jpg'
    }
  ]
};

// ─── INITIALIZATION ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('pt_user');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      currentUser = data.user;
      authToken = data.token;
      onLoginSuccess();
    } catch (e) {
      localStorage.removeItem('pt_user');
    }
  }

  fetchBooks();
  renderBookHouseDashboard();
});

// ─── API HELPER ───────────────────────────────────────────────
async function api(endpoint, options = {}) {
  const headers = options.headers || {};
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${API}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (err) {
    showToast(err.message, 'error');
    throw err;
  }
}

// ─── TOAST NOTIFICATION ───────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.getElementById('toastNotice');
  const msgElem = document.getElementById('toastNoticeMsg');
  if (!toast || !msgElem) return;
  msgElem.textContent = message;

  const icon = toast.querySelector('i');
  if (icon) {
    if (type === 'error') {
      icon.className = 'fa-solid fa-circle-exclamation';
      icon.style.color = '#ef4444';
    } else {
      icon.className = 'fa-solid fa-circle-check';
      icon.style.color = 'var(--primary-coral)';
    }
  }

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── MODAL HELPERS ────────────────────────────────────────────
function openModal(id) { 
  const el = document.getElementById(id);
  if (el) el.classList.add('active'); 
}

function closeModal(id) { 
  const el = document.getElementById(id);
  if (el) el.classList.remove('active'); 
}

// ─── NAVIGATION TAB SWITCHER ──────────────────────────────────
function navigateTab(tabName) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent.toLowerCase().includes(tabName)) {
      link.classList.add('active');
    }
  });

  if (tabName === 'dashboard') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (tabName === 'explore') {
    openModal('bookModal');
    showAllExploreBooks();
  } else if (tabName === 'reviews') {
    showToast('Displaying reader reviews');
    if (allBooks.length > 0) openBookDetail(allBooks[0]._id);
  } else if (tabName === 'favourites') {
    openFavouritesModal();
  }
}

// ─── CATEGORY FILTER TOGGLE ───────────────────────────────────
function cycleCategoryFilter() {
  categoryIndex = (categoryIndex + 1) % categoriesList.length;
  selectedCategory = categoriesList[categoryIndex];
  document.getElementById('selectedCategoryLabel').textContent = selectedCategory === 'All' ? 'Categories' : selectedCategory;
  showToast(`Category: ${selectedCategory}`);
}

// ─── EXECUTE SEARCH ───────────────────────────────────────────
async function executeSearch() {
  const keyword = document.getElementById('searchInput').value.trim();
  if (!keyword) {
    return showToast('Type a title or author to search');
  }

  try {
    const data = await api(`/books/search?keyword=${encodeURIComponent(keyword)}`);
    if (data.books && data.books.length > 0) {
      openBookDetail(data.books[0]._id);
      showToast(`Found ${data.count} result(s)`);
    } else {
      showToast('No books matching that keyword');
    }
  } catch (err) {}
}

function handleSearch(e) {
  if (e.key === 'Enter') {
    executeSearch();
  }
}

// ─── DASHBOARD POPULATION ─────────────────────────────────────
function renderBookHouseDashboard() {
  // 1. Trending Books (2 Cards)
  const trendingRow = document.getElementById('trendingBooksRow');
  if (trendingRow) {
    trendingRow.innerHTML = referenceMockBooks.trending.map(book => `
      <div class="trending-item" onclick="findAndOpenBook('${book.title.replace(/'/g, "\\'")}')">
        <div class="trending-cover-wrap">
          <img src="${book.cover}" alt="${book.title}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" />
        </div>
        <div class="trending-info">
          <div class="trending-title">${book.title}</div>
          <div class="trending-author">${book.author}</div>
          <div class="trending-rating">
            <span class="stars">
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
            </span>
            <span>${book.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    `).join('') + `
      <div class="carousel-arrow-btn" onclick="showToast('Browsing next trending collection')">
        <i class="fa-solid fa-chevron-right"></i>
      </div>
    `;
  }

  // 2. Newly Added Books (5 Mini Books)
  const newlyAddedRow = document.getElementById('newlyAddedRow');
  if (newlyAddedRow) {
    newlyAddedRow.innerHTML = referenceMockBooks.newlyAdded.map(book => `
      <div class="mini-book-card" onclick="findAndOpenBook('${book.title.replace(/'/g, "\\'")}')">
        <img class="mini-cover" src="${book.cover}" alt="${book.title}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" />
        <div class="mini-title">${book.title}</div>
        <div class="mini-author">${book.author}</div>
      </div>
    `).join('');
  }

  // 3. Special Deals & Discounts Table
  const dealsBody = document.getElementById('dealsTableBody');
  if (dealsBody) {
    dealsBody.innerHTML = referenceMockBooks.deals.map(deal => `
      <tr>
        <td class="title-col">
          <div class="deal-book-cell" onclick="findAndOpenBook('${deal.title.replace(/'/g, "\\'")}')" style="cursor:pointer;">
            <img class="deal-thumb" src="${deal.cover}" alt="${deal.title}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" />
            <div>
              <div style="font-weight:700; color:var(--text-dark);">${deal.title}</div>
              <div style="font-size:0.68rem; color:var(--text-muted); font-weight:500;">${deal.author}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="deal-pill ${deal.offer.includes('30%') ? 'hot' : ''}">⚡ ${deal.offer}</span>
        </td>
        <td class="fine-col" style="font-weight:800; color:var(--primary-coral);">
          ₹${deal.dealPrice} <span class="old-price">₹${deal.oldPrice}</span>
        </td>
        <td style="text-align:right;">
          <button class="btn-deal-grab" onclick="quickAddToCartAndCheckout('${deal.title.replace(/'/g, "\\'")}')">Grab Deal</button>
        </td>
      </tr>
    `).join('');
  }

  // 4. History (3 Books)
  const historyRow = document.getElementById('historyBooksRow');
  if (historyRow) {
    historyRow.innerHTML = referenceMockBooks.history.map(book => `
      <div class="history-card" onclick="findAndOpenBook('${book.title.replace(/'/g, "\\'")}')">
        <img class="history-cover" src="${book.cover}" alt="${book.title}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" />
        <div class="history-title">${book.title}</div>
        <div class="history-author">${book.author}</div>
      </div>
    `).join('') + `
      <div class="carousel-arrow-btn" onclick="openHistoryModal()">
        <i class="fa-solid fa-chevron-right"></i>
      </div>
    `;
  }

  // 5. Favourites (4 Books)
  const favRow = document.getElementById('favouritesRow');
  if (favRow) {
    favRow.innerHTML = referenceMockBooks.favourites.map(book => `
      <div class="fav-card" onclick="findAndOpenBook('${book.title.replace(/'/g, "\\'")}')">
        <img class="fav-cover" src="${book.cover}" alt="${book.title}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" />
        <div class="fav-title">${book.title}</div>
        <div class="fav-author">${book.author}</div>
      </div>
    `).join('') + `
      <div class="carousel-arrow-btn" onclick="openFavouritesModal()">
        <i class="fa-solid fa-chevron-right"></i>
      </div>
    `;
  }

  // 6. Scheduled Drops (Live in 2 Days)
  const cartRow = document.getElementById('cartWidgetRow');
  if (cartRow) {
    cartRow.innerHTML = referenceMockBooks.scheduledDrops.map(book => `
      <div class="cart-widget-item">
        <img class="cart-widget-cover" src="${book.cover}" alt="${book.title}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" onclick="findAndOpenBook('${book.title.replace(/'/g, "\\'")}')" style="cursor:pointer;" />
        <div class="cart-widget-details">
          <div class="cart-widget-title" onclick="findAndOpenBook('${book.title.replace(/'/g, "\\'")}')" style="cursor:pointer;">${book.title}</div>
          <div class="cart-widget-author">${book.author}</div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.15rem;">
            <span class="badge-scheduled-pill"><i class="fa-regular fa-clock"></i> 2 Days</span>
            <span style="font-size:0.75rem; font-weight:800; color:var(--primary-coral);">₹${book.price}</span>
          </div>
          <button class="btn-coral-checkout" onclick="preOrderBook('${book.title.replace(/'/g, "\\'")}')">
            <i class="fa-solid fa-bell" style="font-size:0.6rem;"></i> Pre-Book
          </button>
        </div>
      </div>
    `).join('');
  }
}

// ─── ACCURATE BOOK OPENING (Fixes Image/Book Discrepancy) ───────
function findAndOpenBook(title) {
  if (!title) return;
  const cleanTitle = title.trim().toLowerCase();

  // 1. Search in backend fetched books
  let match = allBooks.find(b => b.title.toLowerCase().trim() === cleanTitle);
  if (!match) {
    match = allBooks.find(b => b.title.toLowerCase().includes(cleanTitle) || cleanTitle.includes(b.title.toLowerCase()));
  }

  if (match) {
    recordHistory(match);
    openBookDetail(match._id);
    return;
  }

  // 2. Search in mock catalog data to render exact matching details (NEVER open random book!)
  const allMockLists = [
    ...(referenceMockBooks.trending || []),
    ...(referenceMockBooks.newlyAdded || []),
    ...(referenceMockBooks.history || []),
    ...(referenceMockBooks.favourites || []),
    ...(referenceMockBooks.deals || []),
    ...(referenceMockBooks.scheduledDrops || [])
  ];

  const mockMatch = allMockLists.find(b => b.title.toLowerCase().includes(cleanTitle) || cleanTitle.includes(b.title.toLowerCase()));

  if (mockMatch) {
    recordHistory(mockMatch);
    renderStandaloneBookModal(mockMatch);
  } else {
    showToast(`Viewing ${title}`);
  }
}

function renderStandaloneBookModal(book) {
  const modalBody = document.getElementById('bookModalBody');
  modalBody.innerHTML = `
    <div style="display:flex; gap:1.5rem; flex-wrap:wrap; margin-bottom:1.5rem;">
      <img src="${book.cover || '/uploads/default-book-cover.png'}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" style="width:140px; height:190px; object-fit:cover; border-radius:10px; box-shadow:0 4px 6px rgba(0,0,0,0.1);" />
      <div style="flex:1; min-width:200px;">
        <span style="background:#fee2e2; color:#ef4444; font-size:0.68rem; font-weight:800; padding:0.2rem 0.6rem; border-radius:999px; text-transform:uppercase;">${book.genre || 'Bestseller'}</span>
        <h2 style="font-size:1.3rem; font-weight:800; margin:0.4rem 0 0.2rem;">${book.title}</h2>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:0.6rem;">by ${book.author}</p>
        <div style="font-size:1.2rem; font-weight:800; color:var(--primary-coral); margin-bottom:0.6rem;">₹${book.price || book.dealPrice || 499}</div>
        <p style="font-size:0.82rem; color:var(--text-mid); line-height:1.5; margin-bottom:1rem;">${book.description || 'Critically acclaimed bestseller celebrated worldwide for its transformative insights and storytelling.'}</p>
        <div style="display:flex; gap:0.65rem; flex-wrap:wrap;">
          <button class="btn-primary-coral" style="width:auto; padding:0.55rem 1.25rem;" onclick="quickAddToCartAndCheckout('${book.title.replace(/'/g, "\\'")}')">Add to Cart</button>
          <button class="btn-outline" onclick="preOrderBook('${book.title.replace(/'/g, "\\'")}')">Pre-Book</button>
          <button class="btn-outline" style="border-color:#f43f5e; color:#f43f5e;" onclick="saveLocalFavourite('${book.title.replace(/'/g, "\\'")}', '${book.author.replace(/'/g, "\\'")}', '${book.cover}')"><i class="fa-solid fa-heart"></i> Favourite</button>
        </div>
      </div>
    </div>
    <div style="border-top:1px solid #f1f5f9; padding-top:1rem;">
      <h3 style="font-size:1rem; font-weight:800; margin-bottom:0.75rem;">Verified Reader Reviews</h3>
      <div style="padding:0.75rem 0; border-bottom:1px solid #f1f5f9;">
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700; margin-bottom:0.2rem;">
          <span>Joshua J.</span>
          <span style="color:var(--star-gold);"><i class="fa-solid fa-star"></i> 5.0</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-mid);">Phenomenal read! Highly recommended to everyone looking for depth and clarity.</p>
      </div>
    </div>
  `;
  openModal('bookModal');
}

// ─── READING HISTORY TRACKER ──────────────────────────────────
function recordHistory(book) {
  try {
    let history = JSON.parse(localStorage.getItem('pt_reading_history') || '[]');
    history = history.filter(h => h.title.toLowerCase() !== book.title.toLowerCase());
    history.unshift({
      title: book.title,
      author: book.author || 'Author',
      cover: book.cover || book.coverImage || '/uploads/default-book-cover.png',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: book.price || 499
    });
    if (history.length > 20) history = history.slice(0, 20);
    localStorage.setItem('pt_reading_history', JSON.stringify(history));
  } catch (e) {}
}

function openHistoryModal() {
  openModal('historyModal');
  const body = document.getElementById('historyModalBody');
  if (!body) return;

  let historyList = [];
  try {
    historyList = JSON.parse(localStorage.getItem('pt_reading_history') || '[]');
  } catch (e) {}

  if (!historyList.length) {
    historyList = referenceMockBooks.history.map(h => ({
      title: h.title,
      author: h.author,
      cover: h.cover,
      price: h.price || 599,
      time: 'Recently viewed'
    }));
  }

  body.innerHTML = `
    <div class="modal-grid-cards">
      ${historyList.map(book => `
        <div class="modal-book-card">
          <img class="modal-book-cover" src="${book.cover || '/uploads/default-book-cover.png'}" alt="${book.title}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" onclick="findAndOpenBook('${book.title.replace(/'/g, "\\'")}')" style="cursor:pointer;" />
          <div style="font-size:0.8rem; font-weight:700; color:var(--text-dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" onclick="findAndOpenBook('${book.title.replace(/'/g, "\\'")}')" style="cursor:pointer;">${book.title}</div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:0.25rem;">${book.author}</div>
          <div style="font-size:0.68rem; color:var(--text-mid); margin-bottom:0.5rem;"><i class="fa-regular fa-clock"></i> ${book.time || 'Recently'}</div>
          <div style="display:flex; gap:0.4rem; margin-top:auto;">
            <button class="btn-primary-coral" style="flex:1; padding:0.35rem 0.5rem; font-size:0.72rem;" onclick="findAndOpenBook('${book.title.replace(/'/g, "\\'")}')">View Details</button>
            <button class="btn-outline" style="padding:0.35rem 0.5rem; font-size:0.72rem;" onclick="quickAddToCartAndCheckout('${book.title.replace(/'/g, "\\'")}')">Buy</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function clearReadingHistory() {
  localStorage.removeItem('pt_reading_history');
  showToast('Reading history cleared');
  openHistoryModal();
}

// ─── FAVOURITES / WISHLIST MODAL & MANAGEMENT ─────────────────
async function openFavouritesModal() {
  openModal('favouritesModal');
  const body = document.getElementById('favouritesModalBody');
  const countLabel = document.getElementById('favModalCount');
  if (!body) return;

  let favList = [];

  if (authToken) {
    try {
      const data = await api('/wishlist');
      if (data && data.wishlist && data.wishlist.length > 0) {
        favList = data.wishlist.map(b => ({
          _id: b._id,
          title: b.title,
          author: b.author,
          cover: b.coverImage,
          price: b.price,
          genre: b.genre
        }));
      }
    } catch (e) {}
  }

  if (!favList.length) {
    try {
      const saved = JSON.parse(localStorage.getItem('pt_favourites') || 'null');
      if (saved && saved.length > 0) {
        favList = saved;
      }
    } catch (e) {}
  }

  if (!favList.length) {
    favList = referenceMockBooks.favourites.map(f => ({
      title: f.title,
      author: f.author,
      cover: f.cover,
      price: f.price || 499,
      genre: 'Bestseller'
    }));
  }

  if (countLabel) countLabel.textContent = `${favList.length} book(s)`;

  body.innerHTML = `
    <div class="modal-grid-cards">
      ${favList.map(book => `
        <div class="modal-book-card">
          <img class="modal-book-cover" src="${book.cover || '/uploads/default-book-cover.png'}" alt="${book.title}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" onclick="findAndOpenBook('${book.title.replace(/'/g, "\\'")}')" style="cursor:pointer;" />
          <div style="font-size:0.8rem; font-weight:700; color:var(--text-dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" onclick="findAndOpenBook('${book.title.replace(/'/g, "\\'")}')" style="cursor:pointer;">${book.title}</div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:0.4rem;">${book.author}</div>
          <div style="font-size:0.85rem; font-weight:800; color:var(--primary-coral); margin-bottom:0.5rem;">₹${book.price || 499}</div>
          <div style="display:flex; gap:0.4rem; margin-top:auto;">
            <button class="btn-primary-coral" style="flex:1; padding:0.35rem 0.5rem; font-size:0.72rem;" onclick="quickAddToCartAndCheckout('${book.title.replace(/'/g, "\\'")}')">Add to Cart</button>
            <button class="btn-outline" style="padding:0.35rem 0.55rem; font-size:0.72rem; color:#ef4444; border-color:#fee2e2;" onclick="removeFavouriteBook('${book.title.replace(/'/g, "\\'")}', '${book._id || ''}')" title="Remove"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function saveLocalFavourite(title, author, cover) {
  try {
    let list = JSON.parse(localStorage.getItem('pt_favourites') || '[]');
    if (!list.some(b => b.title.toLowerCase() === title.toLowerCase())) {
      list.push({ title, author, cover, price: 499 });
      localStorage.setItem('pt_favourites', JSON.stringify(list));
    }
    showToast(`Added "${title}" to your Favourites! ❤️`);
  } catch (e) {}
}

async function removeFavouriteBook(title, bookId) {
  if (bookId && authToken) {
    try {
      await api(`/wishlist/${bookId}`, { method: 'DELETE' });
    } catch (e) {}
  }
  try {
    let list = JSON.parse(localStorage.getItem('pt_favourites') || '[]');
    list = list.filter(b => b.title.toLowerCase() !== title.toLowerCase());
    localStorage.setItem('pt_favourites', JSON.stringify(list));
  } catch (e) {}

  showToast(`Removed from favourites`);
  openFavouritesModal();
}

// ─── SCHEDULED DROPS / PRE-ORDERS ─────────────────────────────
function openScheduledDropsModal() {
  openModal('scheduledDropsModal');
  const body = document.getElementById('scheduledDropsModalBody');
  if (!body) return;

  const drops = referenceMockBooks.scheduledDrops;

  body.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
      ${drops.map(book => `
        <div style="background:#f8fafc; border:1px solid #f1f5f9; border-radius:12px; padding:1rem; display:flex; gap:1rem;">
          <img src="${book.cover}" alt="${book.title}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" style="width:75px; height:105px; object-fit:cover; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.1); flex-shrink:0;" />
          <div style="display:flex; flex-direction:column; justify-content:space-between; flex:1;">
            <div>
              <span class="badge-scheduled-pill" style="margin-bottom:0.35rem;"><i class="fa-regular fa-clock"></i> Goes live in 2 days</span>
              <div style="font-size:0.85rem; font-weight:700; color:var(--text-dark); line-height:1.2;">${book.title}</div>
              <div style="font-size:0.72rem; color:var(--text-muted); margin-top:0.15rem;">${book.author}</div>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.75rem;">
              <span style="font-size:0.9rem; font-weight:800; color:var(--primary-coral);">₹${book.price}</span>
              <button class="btn-primary-coral" style="width:auto; padding:0.35rem 0.85rem; font-size:0.75rem;" onclick="preOrderBook('${book.title.replace(/'/g, "\\'")}')">
                <i class="fa-solid fa-bell"></i> Pre-Book
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function preOrderBook(title) {
  showToast(`Pre-order confirmed for "${title}"! You will be notified the instant it goes live in 2 days. 🚀`);
}

async function quickAddToCartAndCheckout(title) {
  let match = allBooks.find(b => b.title.toLowerCase().includes(title.toLowerCase()));
  if (match) {
    await addToCart(match._id);
  } else {
    showToast(`Added ${title} to checkout queue`);
  }
  proceedToCheckout();
}

// ─── BOOKS RETRIEVAL (API) ────────────────────────────────────
async function fetchBooks() {
  try {
    const data = await api('/books?limit=100');
    allBooks = data.books || [];
  } catch (err) {}
}

function showAllExploreBooks() {
  const body = document.getElementById('bookModalBody');
  body.innerHTML = `
    <h2 style="font-size:1.4rem; font-weight:800; margin-bottom:1.25rem;">Explore All Books</h2>
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:1rem;">
      ${allBooks.map(b => `
        <div style="cursor:pointer; text-align:center;" onclick="openBookDetail('${b._id}')">
          <img src="${b.coverImage || '/uploads/default-book-cover.png'}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" style="width:100%; height:160px; object-fit:cover; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1); margin-bottom:0.4rem;" />
          <div style="font-size:0.78rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${b.title}</div>
          <div style="font-size:0.7rem; color:var(--text-muted);">₹${b.price}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── BOOK DETAIL & REVIEWS MODAL ──────────────────────────────
async function openBookDetail(bookId) {
  try {
    const [book, reviews] = await Promise.all([
      api(`/books/${bookId}`),
      api(`/reviews/book/${bookId}`).catch(() => []),
    ]);

    recordHistory(book);

    let reviewsHtml = '';
    if (reviews && reviews.length) {
      reviewsHtml = reviews.map(r => `
        <div style="padding:0.75rem 0; border-bottom:1px solid #f1f5f9;">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700; margin-bottom:0.2rem;">
            <span>${r.userName || 'Reader'}</span>
            <span style="color:var(--star-gold);"><i class="fa-solid fa-star"></i> ${r.rating}</span>
          </div>
          <p style="font-size:0.8rem; color:var(--text-mid);">${r.comment}</p>
        </div>
      `).join('');
    } else {
      reviewsHtml = '<p style="color:var(--text-muted); font-size:0.8rem;">No customer reviews yet.</p>';
    }

    document.getElementById('bookModalBody').innerHTML = `
      <div style="display:flex; gap:1.5rem; flex-wrap:wrap; margin-bottom:1.5rem;">
        <img src="${book.coverImage || '/uploads/default-book-cover.png'}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" style="width:140px; height:190px; object-fit:cover; border-radius:10px; box-shadow:0 4px 6px rgba(0,0,0,0.1);" />
        <div style="flex:1; min-width:200px;">
          <span style="background:#fee2e2; color:#ef4444; font-size:0.68rem; font-weight:800; padding:0.2rem 0.6rem; border-radius:999px; text-transform:uppercase;">${book.genre || 'General'}</span>
          <h2 style="font-size:1.3rem; font-weight:800; margin:0.4rem 0 0.2rem;">${book.title}</h2>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:0.6rem;">by ${book.author}</p>
          <div style="font-size:1.2rem; font-weight:800; color:var(--primary-coral); margin-bottom:0.6rem;">₹${book.price}</div>
          <p style="font-size:0.82rem; color:var(--text-mid); line-height:1.5; margin-bottom:1rem;">${book.description}</p>
          <div style="display:flex; gap:0.65rem; flex-wrap:wrap;">
            <button class="btn-primary-coral" style="width:auto; padding:0.55rem 1.25rem;" onclick="addToCart('${book._id}')">Add to Cart</button>
            <button class="btn-outline" onclick="buyBookDirect('${book._id}')">Buy Now</button>
            <button class="btn-outline" style="border-color:#f43f5e; color:#f43f5e;" onclick="addToWishlistFrontend('${book._id}', '${book.title.replace(/'/g, "\\'")}', '${book.author.replace(/'/g, "\\'")}', '${book.coverImage}')"><i class="fa-solid fa-heart"></i> Favourite</button>
          </div>
        </div>
      </div>

      <div style="border-top:1px solid #f1f5f9; padding-top:1rem;">
        <h3 style="font-size:1rem; font-weight:800; margin-bottom:0.75rem;">Customer Reviews</h3>
        ${reviewsHtml}
        ${currentUser ? `
        <div style="margin-top:1rem; background:#f8fafc; padding:1rem; border-radius:10px;">
          <div style="font-size:0.8rem; font-weight:700; margin-bottom:0.4rem;">Write a Review</div>
          <textarea class="form-control" id="reviewCommentInput" rows="2" placeholder="Your review comments..."></textarea>
          <button class="btn-primary-coral" style="width:auto; margin-top:0.5rem; padding:0.4rem 1rem; font-size:0.8rem;" onclick="submitReview('${book._id}')">Submit</button>
        </div>
        ` : `<p style="margin-top:0.75rem; font-size:0.78rem; color:var(--text-muted);"><a href="#" onclick="closeModal('bookModal'); openAuthModal('login')" style="color:var(--primary-coral); font-weight:700;">Sign in</a> to leave a review.</p>`}
      </div>
    `;

    openModal('bookModal');
  } catch (err) {}
}

async function submitReview(bookId) {
  const comment = document.getElementById('reviewCommentInput').value.trim();
  if (!comment) return showToast('Please enter your review text', 'error');

  try {
    await api('/reviews', {
      method: 'POST',
      body: JSON.stringify({ bookId, rating: 5, comment }),
    });
    showToast('Review posted');
    openBookDetail(bookId);
  } catch (err) {}
}

// ─── CART MANAGEMENT ──────────────────────────────────────────
async function fetchCart() {
  if (!authToken) return;
  try {
    const cart = await api('/cart');
    renderCartDrawer(cart);
  } catch (err) {}
}

async function addToCart(bookId) {
  if (!authToken) {
    openAuthModal('login');
    return showToast('Please sign in to add items', 'error');
  }
  try {
    const cart = await api('/cart', {
      method: 'POST',
      body: JSON.stringify({ bookId, quantity: 1 }),
    });
    renderCartDrawer(cart);
    showToast('Added to cart');
  } catch (err) {}
}

async function buyBookDirect(bookId) {
  await addToCart(bookId);
  closeModal('bookModal');
  proceedToCheckout();
}

async function updateCartQty(bookId, delta) {
  try {
    const cart = await api('/cart', {
      method: 'POST',
      body: JSON.stringify({ bookId, quantity: delta }),
    });
    renderCartDrawer(cart);
  } catch (err) {}
}

async function removeCartItem(bookId) {
  try {
    const cart = await api(`/cart/${bookId}`, { method: 'DELETE' });
    renderCartDrawer(cart);
    showToast('Item removed');
  } catch (err) {}
}

function renderCartDrawer(cart) {
  const body = document.getElementById('cartDrawerBody');
  const badge = document.getElementById('cartBadgeCount');
  const total = document.getElementById('cartDrawerTotal');

  const items = cart.items || [];
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  if (badge) badge.textContent = count;
  if (total) total.textContent = `₹${(cart.totalPrice || 0).toLocaleString('en-IN')}`;

  if (!items.length) {
    body.innerHTML = `
      <div class="cart-empty-message">
        <i class="fa-solid fa-cart-shopping"></i>
        Your cart is empty.
      </div>`;
    return;
  }

  body.innerHTML = items.map(item => {
    const book = item.book || {};
    return `
      <div class="cart-line-item">
        <img class="cart-line-cover" src="${book.coverImage || '/uploads/default-book-cover.png'}" alt="${book.title || ''}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" />
        <div class="cart-line-info">
          <div class="cart-line-title">${book.title || 'Untitled'}</div>
          <div class="cart-line-author">${book.author || ''}</div>
          <div class="cart-line-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
          <div class="cart-qty-ctrls">
            <button class="qty-btn" onclick="updateCartQty('${book._id}', -1)">−</button>
            <span style="font-weight:700; font-size:0.82rem; min-width:16px; text-align:center;">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQty('${book._id}', 1)">+</button>
            <span style="font-size:0.75rem; color:#94a3b8; cursor:pointer; margin-left:auto;" onclick="removeCartItem('${book._id}')">Remove</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleCartDrawer() {
  document.getElementById('cartDrawer').classList.toggle('active');
  document.getElementById('cartOverlay').classList.toggle('active');
}

// ─── CHECKOUT & PAYMENTS ──────────────────────────────────────
function proceedToCheckout() {
  if (!authToken) return openAuthModal('login');
  const cartDrawer = document.getElementById('cartDrawer');
  if (cartDrawer.classList.contains('active')) toggleCartDrawer();

  const cartTotal = document.getElementById('cartDrawerTotal').textContent;
  document.getElementById('checkoutAmount').textContent = cartTotal === '₹0' ? '₹499' : cartTotal;
  openModal('checkoutModal');
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const shippingAddress = {
    street: document.getElementById('shipStreet').value,
    city: document.getElementById('shipCity').value,
    state: document.getElementById('shipState').value,
    zipCode: document.getElementById('shipZip').value,
    country: 'India',
  };

  try {
    const result = await api('/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress }),
    });

    pendingOrderData = result;
    const rz = result.razorpayOrder;

    if (rz && !rz.isMock && typeof Razorpay !== 'undefined') {
      const options = {
        key: rz.key,
        amount: rz.amount,
        currency: rz.currency,
        name: 'PageTurner',
        description: 'Book Order Checkout',
        order_id: rz.id,
        handler: async function (response) {
          await verifyPayment(result.order._id, response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: { name: currentUser.name, email: currentUser.email },
        theme: { color: '#ff6b6b' },
      };
      const rzp = new Razorpay(options);
      rzp.open();
    } else {
      showToast('Order created. Click Sandbox Verification to complete.');
    }
  } catch (err) {}
}

async function simulateMockPayment() {
  if (!pendingOrderData) {
    await handleCheckoutSubmit(new Event('submit', { cancelable: true }));
    if (!pendingOrderData) return;
  }

  try {
    await api('/orders/verify', {
      method: 'POST',
      body: JSON.stringify({
        orderId: pendingOrderData.order._id,
        razorpayOrderId: pendingOrderData.razorpayOrder.id,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpaySignature: 'mock_signature_valid',
      }),
    });

    pendingOrderData = null;
    closeModal('checkoutModal');
    fetchCart();
    fetchBooks();
    showToast('Payment verified. Order confirmed.');
  } catch (err) {}
}

async function verifyPayment(orderId, rzOrderId, rzPaymentId, rzSignature) {
  try {
    await api('/orders/verify', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        razorpayOrderId: rzOrderId,
        razorpayPaymentId: rzPaymentId,
        razorpaySignature: rzSignature,
      }),
    });
    pendingOrderData = null;
    closeModal('checkoutModal');
    fetchCart();
    fetchBooks();
    showToast('Order confirmed and paid.');
  } catch (err) {}
}

// ─── ORDERS / LIBRARY MODAL ───────────────────────────────────
async function openOrdersModal() {
  if (!authToken) return openAuthModal('login');
  try {
    const orders = await api('/orders');
    const container = document.getElementById('ordersList');

    if (!orders.length) {
      container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:2rem;">No orders found in your library.</p>';
    } else {
      container.innerHTML = orders.map(order => `
        <div style="background:#f8fafc; border-radius:10px; padding:1rem; margin-bottom:0.85rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700; margin-bottom:0.4rem;">
            <span>Order #${order._id.slice(-8).toUpperCase()}</span>
            <span style="color:#10b981;">PAID</span>
          </div>
          <div style="font-size:0.82rem; color:var(--text-mid); margin-bottom:0.4rem;">
            ${order.items.map(i => `${i.title || 'Book'} &times; ${i.quantity}`).join(' &bull; ')}
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:800;">
            <span style="color:var(--text-muted);">${new Date(order.createdAt).toLocaleDateString()}</span>
            <span>₹${order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      `).join('');
    }
    openModal('ordersModal');
  } catch (err) {}
}

function openRecommendationsModal() {
  openModal('bookModal');
  const body = document.getElementById('bookModalBody');
  body.innerHTML = `
    <h2 style="font-size:1.3rem; font-weight:800; margin-bottom:1rem;">Recommended for You</h2>
    <p style="font-size:0.85rem; color:var(--text-mid); margin-bottom:1rem;">Based on your reading preferences across finance, psychology, and fiction.</p>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
      ${referenceMockBooks.trending.map(b => `
        <div style="background:#f8fafc; padding:0.85rem; border-radius:10px; display:flex; gap:0.75rem; align-items:center; cursor:pointer;" onclick="findAndOpenBook('${b.title.replace(/'/g, "\\'")}')">
          <img src="${b.cover || '/uploads/default-book-cover.png'}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" style="width:60px; height:85px; object-fit:cover; border-radius:6px;" />
          <div>
            <div style="font-size:0.82rem; font-weight:700;">${b.title}</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">${b.author}</div>
            <div style="font-size:0.82rem; font-weight:800; color:var(--primary-coral); margin-top:0.25rem;">₹${b.price}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── AUTHENTICATION FLOW ──────────────────────────────────────
function handleAuthAction() {
  if (currentUser) {
    if (confirm(`Signed in as ${currentUser.name}. Do you want to log out?`)) {
      logoutUser();
    }
  } else {
    openAuthModal('login');
  }
}

function openAuthModal(mode) {
  authMode = mode || 'login';
  updateAuthUI();
  openModal('authModal');
}

function switchAuthMode(mode) {
  authMode = mode;
  updateAuthUI();
}

function updateAuthUI() {
  const nameGroup = document.getElementById('nameGroup');
  const title = document.getElementById('authTitle');
  const submitBtn = document.getElementById('authSubmitBtn');
  const toggleText = document.getElementById('authToggleText');

  if (authMode === 'register') {
    nameGroup.style.display = 'block';
    title.textContent = 'Create Account';
    submitBtn.textContent = 'Sign Up';
    toggleText.innerHTML = `Already have an account? <a href="#" onclick="switchAuthMode('login')" style="color:var(--primary-coral); font-weight:700;">Sign in</a>`;
  } else {
    nameGroup.style.display = 'none';
    title.textContent = 'Sign In';
    submitBtn.textContent = 'Sign In';
    toggleText.innerHTML = `Don't have an account? <a href="#" onclick="switchAuthMode('register')" style="color:var(--primary-coral); font-weight:700;">Sign up</a>`;
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;

  try {
    if (authMode === 'register') {
      const name = document.getElementById('authName').value.trim();
      if (!name) return showToast('Please enter your full name', 'error');
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      currentUser = data;
      authToken = data.token;
    } else {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      currentUser = data;
      authToken = data.token;
    }

    localStorage.setItem('pt_user', JSON.stringify({ user: currentUser, token: authToken }));
    closeModal('authModal');
    onLoginSuccess();
    showToast(`Welcome, ${currentUser.name}`);
  } catch (err) {}
}

function quickLogin(email, password) {
  document.getElementById('authEmail').value = email;
  document.getElementById('authPassword').value = password;
  authMode = 'login';
  updateAuthUI();
  document.getElementById('authForm').dispatchEvent(new Event('submit', { cancelable: true }));
}

function onLoginSuccess() {
  const nameLabel = document.getElementById('userNameLabel');
  const avatarElem = document.getElementById('userAvatarElem');
  const authText = document.getElementById('authActionText');

  if (nameLabel) nameLabel.textContent = currentUser.name;
  if (avatarElem) avatarElem.textContent = currentUser.name.charAt(0).toUpperCase();
  if (authText) authText.textContent = 'Log Out';

  if (currentUser.role === 'admin') {
    document.getElementById('adminSidebarBtn').style.display = 'flex';
  }

  fetchCart();
}

function logoutUser() {
  currentUser = null;
  authToken = null;
  localStorage.removeItem('pt_user');

  document.getElementById('userNameLabel').textContent = 'Joshua J';
  document.getElementById('userAvatarElem').innerHTML = '<i class="fa-regular fa-user"></i>';
  document.getElementById('authActionText').textContent = 'Log In';
  document.getElementById('adminSidebarBtn').style.display = 'none';
  document.getElementById('cartBadgeCount').textContent = '0';

  showToast('Logged out');
}

// ─── ADMIN CATALOG MANAGER ────────────────────────────────────
function openAdminModal() {
  if (!currentUser || currentUser.role !== 'admin') {
    return showToast('Admin access required', 'error');
  }
  resetAdminForm();
  loadAdminBooks();
  openModal('adminModal');
}

async function loadAdminBooks() {
  try {
    const data = await api('/books?limit=100');
    const container = document.getElementById('adminBooksList');
    container.innerHTML = (data.books || []).map(book => `
      <div style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0; border-bottom:1px solid #f1f5f9;">
        <img src="${book.coverImage || '/uploads/default-book-cover.png'}" onerror="this.onerror=null;this.src='/uploads/default-book-cover.png'" style="width:36px; height:50px; object-fit:cover; border-radius:4px;" />
        <div style="flex:1;">
          <div style="font-size:0.82rem; font-weight:700;">${book.title}</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">${book.author} &bull; ₹${book.price}</div>
        </div>
        <button class="btn-outline" style="padding:0.25rem 0.6rem; font-size:0.75rem;" onclick="deleteBookAdmin('${book._id}')">Delete</button>
      </div>
    `).join('');
  } catch (err) {}
}

async function addToWishlistFrontend(bookId, title, author, cover) {
  if (bookId && authToken) {
    try {
      const res = await api('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ bookId })
      });
      showToast(res.message || 'Book added to your favourites! ❤️');
      return;
    } catch (err) {
      // If already wishlisted or error, still ensure local state
    }
  }

  saveLocalFavourite(title || 'Book', author || 'Author', cover || '/uploads/default-book-cover.png');
}

function resetAdminForm() {
  document.getElementById('adminBookId').value = '';
  document.getElementById('adminBookForm').reset();
  document.getElementById('adminFormSubmitBtn').textContent = 'Save Book';
}

async function handleAdminBookSubmit(e) {
  e.preventDefault();
  const bookId = document.getElementById('adminBookId').value;
  const formData = new FormData();

  formData.append('title', document.getElementById('adminTitle').value);
  formData.append('author', document.getElementById('adminAuthor').value);
  formData.append('genre', document.getElementById('adminGenre').value);
  formData.append('price', document.getElementById('adminPrice').value);
  formData.append('stock', document.getElementById('adminStock').value);
  formData.append('description', document.getElementById('adminDescription').value);

  const coverFile = document.getElementById('adminCoverFile').files[0];
  const coverUrl = document.getElementById('adminCoverUrl').value.trim();
  if (coverFile) {
    formData.append('coverImage', coverFile);
  } else if (coverUrl) {
    formData.append('coverImageUrl', coverUrl);
  }

  try {
    const url = bookId ? `/books/${bookId}` : '/books';
    const method = bookId ? 'PUT' : 'POST';
    await fetch(`${API}${url}`, {
      method,
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData,
    }).then(r => r.json());

    showToast(bookId ? 'Book updated' : 'Book created');
    resetAdminForm();
    loadAdminBooks();
    fetchBooks();
  } catch (err) {
    showToast('Failed to save book', 'error');
  }
}

async function deleteBookAdmin(bookId) {
  if (!confirm('Are you sure you want to delete this book?')) return;
  try {
    await api(`/books/${bookId}`, { method: 'DELETE' });
    showToast('Book deleted');
    loadAdminBooks();
    fetchBooks();
  } catch (err) {}
}
