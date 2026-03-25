/**
 * Swayam Explore Logic
 * Handles dynamic rendering, filtering, and interactions for Hackathons and Internships.
 */

const ExploreModule = (() => {
  // --- Data Sources ---
  const MOCK_HACKATHONS = [
    {
      id: "h1",
      title: "Swayam Sprint",
      org: "Swayam",
      desc: "A 48-hour sprint to build educational tools for the future.",
      domain: "Web Dev",
      location: "Online",
      type: "Live",
      prize: "₹50,000",
      time: "Ends in 24h",
      users: "120",
      gradient: "linear-gradient(135deg, #38bdf8, #2563eb)",
      logo: "SS",
      registered: true,
      status: "ongoing", // active participation state
      tags: ["Web Dev", "Education"]
    },
    {
      id: "h2",
      title: "DeFi Buildathon",
      org: "CryptoX",
      desc: "Create decentralized finance solutions on Ethereum.",
      domain: "Blockchain",
      location: "Online",
      type: "Upcoming",
      prize: "$5,000",
      time: "Oct 15 - Oct 20",
      users: "450",
      gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
      logo: "DB",
      registered: false,
      tags: ["Blockchain", "Web3"]
    },
    {
      id: "h3",
      title: "GreenTech Hack",
      org: "EcoInnovate",
      desc: "Building sustainable software solutions for climate change.",
      domain: "Open Innovation",
      location: "Offline",
      type: "Live",
      prize: "₹75,000",
      time: "Ends in 12h",
      users: "320",
      gradient: "linear-gradient(135deg, #22c55e, #10b981)",
      logo: "GT",
      registered: false,
      tags: ["Open Innovation", "IoT"]
    },
    {
      id: "h4",
      title: "HealthHack 2.0",
      org: "MedTech Labs",
      desc: "Innovating healthcare through code. Build software.",
      domain: "AI",
      location: "Offline",
      type: "Upcoming",
      prize: "₹1,50,000",
      time: "Nov 1 - Nov 3",
      users: "50+ (Teams)",
      gradient: "linear-gradient(135deg, #f59e0b, #f97316)",
      logo: "HH",
      registered: true,
      status: "registered",
      tags: ["Healthcare", "AI"]
    }
  ];

  const MOCK_INTERNSHIPS = [
    {
      id: "i1",
      role: "React Developer",
      company: "MetaSphere",
      verified: true,
      rating: "4.8",
      desc: "Build scalable UIs for the next-gen metaverse platform.",
      location: "Remote",
      stipend: 40000,
      duration: "6 Months",
      type: "Remote",
      tags: ["React", "UI/UX", "Web3"],
      logo: "MS",
      gradient: "linear-gradient(135deg, #38bdf8, #2563eb)",
      saved: true
    },
    {
      id: "i2",
      role: "AI Data Intern",
      company: "NeuroCore",
      verified: true,
      rating: "4.5",
      desc: "Process data and fine-tune language models.",
      location: "Bangalore",
      stipend: 25000,
      duration: "3 Months",
      type: "Onsite",
      tags: ["Python", "AI/ML"],
      logo: "NC",
      gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
      saved: false
    },
    {
      id: "i3",
      role: "Backend Engineer",
      company: "CloudFlow",
      verified: false,
      rating: "3.9",
      desc: "Develop scalable microservices for real-time applications.",
      location: "Mumbai",
      stipend: 15000,
      duration: "3 Months",
      type: "Hybrid",
      tags: ["Node.js", "Python"],
      logo: "CF",
      gradient: "linear-gradient(135deg, #22c55e, #10b981)",
      saved: false
    },
    {
      id: "i4",
      role: "UI/UX Designer",
      company: "DesignShift",
      verified: true,
      rating: "4.9",
      desc: "Create beautiful, accessible, and inclusive interfaces.",
      location: "Remote",
      stipend: 10000,
      duration: "1 Month",
      type: "Remote",
      tags: ["UI/UX"],
      logo: "DS",
      gradient: "linear-gradient(135deg, #f59e0b, #f97316)",
      saved: false
    }
  ];

  // --- State ---
  let hackathonFilter = {
    category: "All", // All, AI, Web Dev, Blockchain, Open Innovation
    location: null, // Online, Offline
    type: null, // Live, Upcoming
    search: ""
  };

  let internshipFilter = {
    search: "",
    mode: { remote: true, onsite: false, hybrid: false },
    stipend: 10000,
    location: "Any Location",
    duration: "Any Duration",
    skills: ["React", "UI/UX"],
    verifiedOnly: true,
    ratingOnly: false
  };

  function init() {
    bindHackathonEvents();
    bindInternshipEvents();
    
    renderHackathons();
    renderInternships();
  }

  // ============== HACKATHONS ==============

  function bindHackathonEvents() {
    // Top Categories
    const categoryChips = document.querySelectorAll('.hackathon-filters-bar .hackathon-filter-group:nth-child(1) .hackathon-filter-chip');
    categoryChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        categoryChips.forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        hackathonFilter.category = e.target.textContent.trim() === 'AI' ? 'AI' :
                                    e.target.textContent.trim() === 'All' ? 'All' : e.target.textContent.trim();
        renderHackathons();
      });
    });

    // Interaction Modal (Delegation)
    const exploreGrid = document.querySelector('.explore-hackathons-grid');
    if(exploreGrid) {
      exploreGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.explore-hack-card');
        if (card && !e.target.closest('.explore-register-btn')) {
          const id = card.dataset.id;
          const hack = MOCK_HACKATHONS.find(h => h.id === id);
          if(hack) openHackathonModal(hack);
        }
      });
    }

    // Search bar
    const searchInput = document.getElementById('hackathon-search-input');
    if(searchInput) {
      searchInput.addEventListener('input', (e) => {
        hackathonFilter.search = e.target.value.toLowerCase();
        renderHackathons();
      });
    }
  }

  function renderHackathons() {
    // 1. My Hackathons
    const myGrid = document.querySelector('.my-hackathons-grid');
    if (myGrid) {
      const myHacks = MOCK_HACKATHONS.filter(h => h.registered);
      
      if (myHacks.length === 0) {
        myGrid.innerHTML = `
          <div class="empty-state-glass">
            <span class="material-icons-round text-muted" style="font-size:3rem;">sentiment_dissatisfied</span>
            <h4 style="margin-top:12px;">No hackathons joined yet</h4>
            <p class="text-muted">Start your journey by enrolling in an upcoming event.</p>
            <button class="btn btn-outline mt-12" onclick="document.querySelector('.explore-hackathons-grid').scrollIntoView({behavior:'smooth'})">Explore Hackathons</button>
          </div>
        `;
        myGrid.style.gridTemplateColumns = "1fr";
      } else {
        myGrid.style.gridTemplateColumns = ""; // reset
        myGrid.innerHTML = myHacks.map(h => {
          const badgeClass = h.status === 'registered' ? 'registered-badge' : h.status === 'ongoing' ? 'ongoing-badge' : 'submitted-badge';
          const badgeText = h.status.charAt(0).toUpperCase() + h.status.slice(1);
          const liveDot = h.status === 'ongoing' ? '<span class="live-dot"></span>' : '';
          return `
            <div class="my-hack-card glass-card">
              <div class="my-hack-header">
                <div class="my-hack-status-badge ${badgeClass}">${liveDot} ${badgeText}</div>
              </div>
              <h3 class="my-hack-title">${h.title}</h3>
              <p class="my-hack-team">Team: <strong>Solo</strong></p>
              <div class="my-hack-footer">
                <span class="my-hack-timeline"><span class="material-icons-round">schedule</span> ${h.time}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 2. Explore Hackathons
    const exploreGrid = document.querySelector('.explore-hackathons-grid');
    if (exploreGrid) {
      let filtered = MOCK_HACKATHONS.filter(h => {
        // Search
        if (hackathonFilter.search && !h.title.toLowerCase().includes(hackathonFilter.search) && !h.domain.toLowerCase().includes(hackathonFilter.search)) return false;
        
        // Category
        if (hackathonFilter.category !== "All" && h.domain !== hackathonFilter.category) {
          // Fallback matching logic for AI -> AI/ML or Web Dev to Web
          if (!h.tags.some(t => t.includes(hackathonFilter.category))) return false;
        }

        return true;
      });

      if (filtered.length === 0) {
        exploreGrid.innerHTML = `
          <div class="empty-state-glass" style="grid-column: 1/-1;">
            <span class="material-icons-round text-muted" style="font-size:3rem;">search_off</span>
            <h4 style="margin-top:12px;">No hackathons found</h4>
            <p class="text-muted">Try adjusting your filters or search terms.</p>
          </div>
        `;
      } else {
        exploreGrid.innerHTML = filtered.map(h => {
          const statusClass = h.type === 'Live' ? 'live-status' : 'upcoming-status';
          const liveDot = h.type === 'Live' ? '<span class="live-dot"></span>' : '';
          return `
            <div class="explore-hack-card glass-card" style="cursor: pointer; animation: fadeIn 0.3s ease;" data-id="${h.id}">
              <div class="explore-hack-banner" style="background: ${h.gradient};">
                <span class="explore-hack-status ${statusClass}">${liveDot} ${h.type.toUpperCase()}</span>
                <div class="explore-hack-logo">${h.logo}</div>
              </div>
              <div class="explore-hack-body">
                <h3 class="explore-hack-title">${h.title}</h3>
                <p class="explore-hack-org">by ${h.org}</p>
                <p class="explore-hack-desc">${h.desc}</p>

                <div class="explore-hack-tags">
                  ${h.tags.map(t => `<span class="hack-tag">${t}</span>`).join('')}
                </div>

                <div class="explore-hack-stats">
                  <div class="explore-hack-stat"><span class="material-icons-round">payments</span> ${h.prize}</div>
                  <div class="explore-hack-stat"><span class="material-icons-round">schedule</span> ${h.time}</div>
                  <div class="explore-hack-stat"><span class="material-icons-round">groups</span> ${h.users}</div>
                </div>
              </div>

              <div class="explore-hack-quick-info">
                <div class="quick-info-row">
                  <span class="info-label">Eligibility</span>
                  <span class="info-value">University Students</span>
                </div>
                <div class="quick-info-row">
                  <span class="info-label">Domain</span>
                  <span class="info-value">${h.domain}</span>
                </div>
                <div class="quick-info-row">
                  <span class="info-label">Potential XP</span>
                  <span class="info-value xp-value">+300 XP</span>
                </div>
              </div>

              <div class="explore-hack-footer">
                <button class="btn btn-outline explore-details-btn">Details</button>
                <button class="btn btn-primary explore-register-btn" onclick="event.stopPropagation(); window.open('https://devfolio.co', '_blank')">
                  Register <span class="material-icons-round">open_in_new</span>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  function openHackathonModal(h) {
    // Simple alert for now - could be upgraded to a real modal inside the DOM
    let existingDialog = document.getElementById('hackathon-modal');
    if (!existingDialog) {
      existingDialog = document.createElement('div');
      existingDialog.id = 'hackathon-modal';
      existingDialog.innerHTML = `
        <div class="payment-modal-overlay active" style="z-index:999;">
          <div class="payment-modal-glass" style="max-width:500px">
            <div class="payment-modal-header border-bottom pb-12 mb-16">
              <h2 id="hm-title" style="margin:0; font-size:1.5rem">Title</h2>
              <button class="btn-icon" onclick="document.getElementById('hackathon-modal').style.display='none'"><span class="material-icons-round">close</span></button>
            </div>
            <div>
              <p><strong class="text-brand" id="hm-org">Org</strong></p>
              <p id="hm-desc" style="margin: 12px 0;">Desc</p>
              <div style="display:flex; gap:16px; margin: 16px 0;">
                <span class="badge" style="background:var(--bg-hover); padding:6px 12px; border-radius:12px;">🏆 <span id="hm-prize"></span></span>
                <span class="badge" style="background:var(--bg-hover); padding:6px 12px; border-radius:12px;">📍 <span id="hm-loc"></span></span>
              </div>
            </div>
            <button class="btn btn-primary w-100 mt-16" onclick="window.open('https://devfolio.co', '_blank')">Apply Now</button>
          </div>
        </div>
      `;
      document.body.appendChild(existingDialog);
    }
    
    document.getElementById('hm-title').textContent = h.title;
    document.getElementById('hm-org').textContent = h.org;
    document.getElementById('hm-desc').textContent = h.desc;
    document.getElementById('hm-prize').textContent = h.prize;
    document.getElementById('hm-loc').textContent = h.location;
    
    existingDialog.style.display = 'block';
  }

  // ============== INTERNSHIPS ==============

  function bindInternshipEvents() {
    const searchInput = document.getElementById('internship-search-input');
    if(searchInput) {
      searchInput.addEventListener('input', (e) => {
        internshipFilter.search = e.target.value.toLowerCase();
        renderInternships();
      });
    }

    // Stipend Slider
    const stipendRange = document.getElementById('stipend-slider');
    const stipendDisplay = document.getElementById('stipend-display');
    if (stipendRange && stipendDisplay) {
      stipendRange.addEventListener('input', (e) => {
        internshipFilter.stipend = parseInt(e.target.value);
        stipendDisplay.textContent = '₹' + internshipFilter.stipend.toLocaleString() + '+ / month';
        renderInternships();
      });
    }

    // Checkboxes (Mode / Settings)
    const modeCheckboxes = document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]');
    if(modeCheckboxes.length === 3) {
      modeCheckboxes[0].addEventListener('change', e => { internshipFilter.mode.remote = e.target.checked; renderInternships(); });
      modeCheckboxes[1].addEventListener('change', e => { internshipFilter.mode.onsite = e.target.checked; renderInternships(); });
      modeCheckboxes[2].addEventListener('change', e => { internshipFilter.mode.hybrid = e.target.checked; renderInternships(); });
    }

    // Toggles for Verification/Rating
    const verifiedToggle = document.querySelectorAll('.intern-filters-panel .custom-toggle input[type="checkbox"]');
    if(verifiedToggle.length >= 2) {
      verifiedToggle[0].addEventListener('change', e => { internshipFilter.verifiedOnly = e.target.checked; renderInternships(); });
      verifiedToggle[1].addEventListener('change', e => { internshipFilter.ratingOnly = e.target.checked; renderInternships(); });
    }

    // Selects (Location, Duration)
    const selects = document.querySelectorAll('.intern-filters-panel .filter-select');
    if (selects.length >= 2) {
      selects[0].addEventListener('change', e => { internshipFilter.location = e.target.value; renderInternships(); });
      selects[1].addEventListener('change', e => { internshipFilter.duration = e.target.value; renderInternships(); });
    }

    // Skill Tags
    const skillTags = document.querySelectorAll('.f-skill-tag');
    skillTags.forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.target.classList.toggle('active');
        const skill = e.target.textContent.trim();
        if (internshipFilter.skills.includes(skill)) {
          internshipFilter.skills = internshipFilter.skills.filter(s => s !== skill);
        } else {
          internshipFilter.skills.push(skill);
        }
        renderInternships();
      });
    });

    // Clear filters
    const clearBtn = document.getElementById('intern-clear-filters');
    if(clearBtn) {
      clearBtn.addEventListener('click', () => {
        internshipFilter = { search:"", mode:{remote:true,onsite:true,hybrid:true}, stipend:0, location:"Any Location", duration:"Any Duration", skills:[], verifiedOnly:false, ratingOnly:false };
        
        // Reset DOM elements... simplified reset:
        if(searchInput) searchInput.value = '';
        if(stipendRange) { stipendRange.value = 0; stipendDisplay.textContent = '₹0+ / month'; }
        if(selects.length>=2) { selects[0].value="Any Location"; selects[1].value="Any Duration"; }
        skillTags.forEach(t => t.classList.remove('active'));
        if(modeCheckboxes.length===3) modeCheckboxes.forEach(cb => cb.checked = true);
        if(verifiedToggle.length>=2) verifiedToggle.forEach(cb => cb.checked = false);

        renderInternships();
      });
    }
  }

  function renderInternships() {
    const grid = document.querySelector('.internships-grid');
    if (!grid) return;

    let filtered = MOCK_INTERNSHIPS.filter(i => {
      // Search
      if (internshipFilter.search && 
          !i.role.toLowerCase().includes(internshipFilter.search) && 
          !i.company.toLowerCase().includes(internshipFilter.search)) return false;

      // Stipend
      if (i.stipend < internshipFilter.stipend) return false;

      // Location
      if (internshipFilter.location !== "Any Location" && i.location !== internshipFilter.location && i.location !== "Remote") return false;
      
      // Duration
      if (internshipFilter.duration !== "Any Duration" && i.duration !== internshipFilter.duration) return false;

      // Mode
      if (i.type === "Remote" && !internshipFilter.mode.remote) return false;
      if (i.type === "Onsite" && !internshipFilter.mode.onsite) return false;
      if (i.type === "Hybrid" && !internshipFilter.mode.hybrid) return false;

      // Skills (Matches at least one if skills array is not empty)
      if (internshipFilter.skills.length > 0) {
        if (!i.tags.some(t => internshipFilter.skills.includes(t))) return false;
      }

      // Toggles
      if (internshipFilter.verifiedOnly && !i.verified) return false;
      if (internshipFilter.ratingOnly && parseFloat(i.rating) < 4.0) return false;

      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state-glass" style="grid-column: 1/-1; padding: 64px 20px;">
          <span class="material-icons-round text-muted" style="font-size:3rem;">work_off</span>
          <h4 style="margin-top:12px;">No internships found</h4>
          <p class="text-muted">Try removing some filters.</p>
          <button class="btn btn-outline mt-16" onclick="document.getElementById('intern-clear-filters').click()">Clear All Filters</button>
        </div>
      `;
    } else {
      grid.innerHTML = filtered.map(i => {
        const verifiedBadge = i.verified ? `<span class="material-icons-round text-success verified-icon" style="font-size:0.9rem; vertical-align:-1px;">verified</span>` : '';
        const bookmarkIcon = i.saved ? "bookmark" : "bookmark_border";
        const bookmarkClass = i.saved ? "text-brand" : "";
        
        return `
          <div class="intern-card glass-card" style="animation: fadeUpItem 0.4s ease;">
            <div class="intern-card-top">
              <div class="intern-logo-box" style="background: ${i.gradient};">${i.logo}</div>
              <button class="btn-bookmark material-icons-round ${bookmarkClass}" aria-label="Save">${bookmarkIcon}</button>
            </div>
            <h3 class="intern-role">${i.role}</h3>
            <p class="intern-company">${i.company} ${verifiedBadge} <span class="company-rating"><span class="material-icons-round hover-star">star</span> ${i.rating}</span></p>
            <p class="intern-desc">${i.desc}</p>
            
            <div class="intern-tags">
              ${i.tags.map(t => `<span class="i-tag">${t}</span>`).join('')}
            </div>
            
            <div class="intern-meta-grid">
              <div class="i-meta"><span class="material-icons-round">payments</span> ₹${i.stipend.toLocaleString()}/mo</div>
              <div class="i-meta"><span class="material-icons-round">schedule</span> ${i.duration}</div>
              <div class="i-meta"><span class="material-icons-round">location_on</span> ${i.location}</div>
              <div class="i-meta"><span class="material-icons-round">work_outline</span> ${i.type}</div>
            </div>
            
            <button class="btn btn-outline w-100" onclick="window.open('https://example.com', '_blank')">Apply Now</button>
          </div>
        `;
      }).join('');
    }
  }

  return { init };
})();

// Auto-init logic when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // We can attach to swayam:authenticated if needed, but safe to just init
  ExploreModule.init();
});
