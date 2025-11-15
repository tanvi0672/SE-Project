console.log("JS Connected!");
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.hero-slider');
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const indicators = Array.from(document.querySelectorAll('.indicator'));
  const toast = document.getElementById('toast');
  const yearEl = document.getElementById('year');
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('site-search');
  const shareBtn = document.getElementById('share-btn');
  const contactForm = document.getElementById('contact-form');
  const registrationForm = document.getElementById('registration-form');
  let currentSlide = 0;
  let sliderInterval;

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const setSliderWidth = () => {
    if (slider) {
      slider.style.width = `${slides.length * 100}%`;
    }
  };

  const updateIndicators = () => {
    indicators.forEach((indicator, index) => {
      if (index === currentSlide) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  };

  const goToSlide = (index) => {
    if (!slider) return;
    currentSlide = (index + slides.length) % slides.length;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    updateIndicators();
  };

  const nextSlide = () => goToSlide(currentSlide + 1);

  const startSlider = () => {
    stopSlider();
    sliderInterval = setInterval(nextSlide, 7000);
  };

  const stopSlider = () => {
    if (sliderInterval) {
      clearInterval(sliderInterval);
      sliderInterval = null;
    }
  };

  setSliderWidth();
  goToSlide(0);
  startSlider();

  if (slider) {
    slider.addEventListener('mouseenter', stopSlider);
    slider.addEventListener('mouseleave', startSlider);
  }

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      goToSlide(index);
      startSlider();
    });
  });

  const showToast = (message, type = 'info') => {
    if (!toast) return;
    toast.textContent = message;
    toast.dataset.type = type;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };

  // --- Cart helpers (uses localStorage key 'velvet_cart')
  const CART_KEY = 'velvet_cart';

  const getCart = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  };

  const saveCart = (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // trigger storage event for other windows
    try {
      localStorage.setItem(CART_KEY + '_updated_at', Date.now());
    } catch (e) {}
  };

  const addItemToCart = (item) => {
    const cart = getCart();
    // try to find existing entry by name+price (simple dedupe rule)
    const existing = cart.find((c) => c.name === item.name && c.price === item.price && c.image === item.image);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
    } else {
      item.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      item.quantity = item.quantity || 1;
      cart.push(item);
    }
    saveCart(cart);
  };

  const openCartWindow = () => {
    window.open('cart.html', 'velvetCart', 'width=480,height=720');
  };

  document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', (event) => {
      const card = event.currentTarget.closest('.product-card');
      const name = (card?.dataset.name || card?.querySelector('h3')?.textContent || 'Item').toString().trim();
      const priceRaw = card?.dataset.price || card?.querySelector('.price')?.textContent || '';
      const price = parseFloat(String(priceRaw).replace(/[^0-9.]/g, '')) || 0;
      const img = card?.querySelector('img')?.src || '';

      const item = { name, price, image: img, quantity: 1, addedAt: Date.now() };
      addItemToCart(item);
      showToast(`${name} added to your cart.`, 'success');
    });
  });

  // Open cart page when header cart button is clicked
  const headerCartBtn = document.getElementById('header-cart');
  if (headerCartBtn) {
    headerCartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartWindow();
    });
  }

  document.querySelectorAll('.toggle-favorite').forEach((button) => {
    button.addEventListener('click', (event) => {
      const card = event.currentTarget.closest('.product-card');
      const name = card?.dataset.name || 'Item';
      event.currentTarget.classList.toggle('favorited');
      const isFavorited = event.currentTarget.classList.contains('favorited');
      event.currentTarget.setAttribute('aria-pressed', String(isFavorited));
      showToast(
        isFavorited ? `${name} saved to favourites.` : `${name} removed from favourites.`,
        isFavorited ? 'success' : 'info'
      );
    });
  });

  document.querySelectorAll('.share-product').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const card = event.currentTarget.closest('.product-card');
      const name = card?.dataset.name || 'this VelvetWardrobe piece';
      const price = card?.dataset.price ? `$${card.dataset.price}` : '';
      const shareUrl = window.location.href.split('#')[0];
      const shareMessage = price
        ? `Discover ${name} for ${price} at VelvetWardrobe.`
        : `Discover ${name} at VelvetWardrobe.`;

      const shareData = {
        title: `${name} | VelvetWardrobe`,
        text: shareMessage,
        url: shareUrl,
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
          showToast(`Shared ${name} successfully.`, 'success');
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(`${shareMessage} ${shareUrl}`);
          showToast('Link copied—share your style!', 'success');
        } else {
          showToast('Sharing is not supported on this device.', 'error');
        }
      } catch (err) {
        showToast('Unable to share right now. Please try again.', 'error');
      }
    });
  });

  if (searchBtn && searchInput) {
    const performSearch = () => {
      const query = searchInput.value.trim();
      if (!query) {
        showToast('Enter a keyword to search VelvetWardrobe.', 'error');
        searchInput.focus();
        return;
      }
      showToast(`Searching for “${query}”...`, 'info');
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        performSearch();
      }
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: 'VelvetWardrobe',
        text: 'Explore curated luxury collections at VelvetWardrobe.',
        url: window.location.href,
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
          showToast('Shared successfully.', 'success');
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareData.url);
          showToast('Link copied to clipboard.', 'success');
        } else {
          showToast('Sharing is not supported on this device.', 'error');
        }
      } catch (error) {
        showToast('Unable to share, please try again.', 'error');
      }
    });
  }

  const validateEmail = (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  const handleFormSubmission = (form, validator) => {
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const feedback = form.querySelector('.form-feedback');
      const result = validator(form);

      if (!feedback) return;

      feedback.classList.remove('error', 'success');
      if (result.ok) {
        feedback.textContent = result.message;
        feedback.classList.add('success');
        form.reset();
      } else {
        feedback.textContent = result.message;
        feedback.classList.add('error');
      }
    });
  };

  handleFormSubmission(contactForm, (form) => {
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const topic = form.elements.topic.value.trim();
    const message = form.elements.message.value.trim();

    if (!name || !email || !topic || !message) {
      return { ok: false, message: 'Please complete every field before sending your message.' };
    }

    if (!validateEmail(email)) {
      return { ok: false, message: 'Enter a valid email address so we can respond to you.' };
    }

    if (message.length < 20) {
      return { ok: false, message: 'Tell us more—your message should be at least 20 characters long.' };
    }

    showToast('Thank you! A stylist will connect with you soon.', 'success');
    return { ok: true, message: 'Message sent successfully.' };
  });

  handleFormSubmission(registrationForm, (form) => {
    const feedback = form.querySelector('.form-feedback');
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value.trim();
    const confirm = form.elements['confirm-password'].value.trim();

    // 1. Local Validation Checks
    if (!name || !email || !password || !confirm) {
      return { ok: false, message: 'Fill out every detail to create your membership.' };
    }
    if (!validateEmail(email)) {
      return { ok: false, message: 'Enter a valid email to receive exclusive invites.' };
    }
    if (password.length < 8) {
      return { ok: false, message: 'Your password must contain at least 8 characters.' };
    }
    if (password !== confirm) {
      return { ok: false, message: 'The passwords do not match—please try again.' };
    }

    // 2. Prepare Data for Backend
    const userData = {
        name: name,
        email: email,
        password: password
    };
    
    // Clear old feedback and show a waiting toast
    feedback.classList.remove('error', 'success');
    showToast('Registering user...', 'info');

    // 3. API Integration (Backend Call)
    fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(response => {
        // Check for HTTP errors (like 400 or 401)
        if (!response.ok) {
            // Read the error message from the JSON body
            return response.json().then(errorData => { throw new Error(errorData.message || 'Registration failed'); });
        }
        return response.json();
    })
    .then(data => {
        // Successful registration (200 OK)
        if (data.message === "Registered successfully") {
            feedback.textContent = 'Registration successful. Welcome to VelvetWardrobe insiders!';
            feedback.classList.add('success');
            form.reset();
            showToast('Welcome to VelvetWardrobe insiders!', 'success');
        } else {
            // Should not happen if response.ok is true, but good for safety
            throw new Error(data.message || 'Registration failed for an unknown reason.');
        }
    })
    .catch(error => {
        // Handle all errors (connection error, "User already exists", etc.)
        console.error('Registration API Error:', error.message);
        feedback.textContent = error.message.includes('Failed to fetch') 
            ? 'Connection error. Is the server running on port 5000?' 
            : error.message; // Display backend error message
        feedback.classList.add('error');
        showToast('Registration Error!', 'error');
    });

    // We return ok: true here to prevent the default form submission 
    // and let the fetch promise handle the success/failure state asynchronously.
    return { ok: true, message: 'Attempting to register...' };
  });
});
function sendData() {
    const data = { name: "Dear" };

    fetch("http://127.0.0.1:5000/send-data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        alert(result.status);  // Show message in browser
        console.log(result);
    })
    .catch(err => console.error(err));
}




