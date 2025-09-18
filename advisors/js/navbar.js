document.addEventListener("DOMContentLoaded", function() {
  const menuIcon = document.getElementById("menuIcon");
  const navLinks = document.getElementById("navLinks");
  const closeIcon = document.getElementById("closeIcon");
  const teamDropdownBtn = document.getElementById("teamDropdownBtn");
  const teamDropdownContent = document.querySelector(".team-dropdown-content");
  const sponsorBtn = document.querySelector(".sponsor-btn");
  const MOBILE_BREAKPOINT = 970;

  // Move sponsor button to bottom in mobile view
  function adjustSponsorButton() {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      navLinks.appendChild(sponsorBtn);
    } else {
      // Insert before team dropdown for desktop
      const teamDropdown = document.querySelector(".team-dropdown");
      navLinks.insertBefore(sponsorBtn, teamDropdown.nextSibling);
    }
  }

  // Toggle mobile menu
  function toggleMobileMenu(open) {
    if (open) {
      navLinks.classList.add("open");
      menuIcon.classList.add("hide");
      document.body.classList.add("no-scroll");
    } else {
      navLinks.classList.remove("open");
      menuIcon.classList.remove("hide");
      document.body.classList.remove("no-scroll");
      // Close dropdown when closing menu
      if (teamDropdownContent) {
        teamDropdownContent.classList.remove("mobile-open");
      }
    }
  }

  // Handle team dropdown click
  function handleTeamDropdownClick(e) {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      e.preventDefault();
      e.stopPropagation();
      // Close all other dropdowns first if needed
      document.querySelectorAll('.team-dropdown-content').forEach(dropdown => {
        if (dropdown !== teamDropdownContent) {
          dropdown.classList.remove("mobile-open");
        }
      });
      teamDropdownContent.classList.toggle("mobile-open");
    }
  }

  // Initialize
  adjustSponsorButton();

  // Event listeners
  menuIcon.addEventListener("click", () => toggleMobileMenu(true));
  closeIcon.addEventListener("click", () => toggleMobileMenu(false));
  
  document.addEventListener("click", function(e) {
    if (navLinks.classList.contains("open") && 
        !navLinks.contains(e.target) && 
        !menuIcon.contains(e.target)) {
      toggleMobileMenu(false);
    }
  });

  if (teamDropdownBtn && teamDropdownContent) {
    teamDropdownBtn.addEventListener("click", function (e) {
      if (window.innerWidth <= 970) {
        e.preventDefault();
        e.stopPropagation();
        teamDropdownContent.classList.toggle("mobile-open");
      }
    });

    teamDropdownContent.addEventListener("click", function (e) {
      if (window.innerWidth <= 970) {
        e.stopPropagation();
      }
    });
  }

  window.addEventListener("resize", function() {
    adjustSponsorButton();
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      toggleMobileMenu(false);
      if (teamDropdownContent) {
        teamDropdownContent.classList.remove("mobile-open");
      }
    }
  });
});