const links = {
  Platform: ['Browse', 'Trending', 'Schedule', 'Movies', 'TV Series', 'OVA / ONA'],
  Community: ['Forums', 'Reviews', 'Discussions', 'Fan Art', 'Watch Together'],
  Support: ['FAQ', 'Contact', 'DMCA', 'Terms', 'Privacy Policy', 'Accessibility'],
  Apps: ['iOS App', 'Android App', 'Desktop App', 'API Docs'],
}

export default function Footer() {
  return (
    <footer className="mt-12 border-t pb-20 md:pb-0" style={{ borderColor: '#23252b' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10 py-10">
        {/* Top */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-4 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 14L9 4L15 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.5 10H12.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold">Ani<span style={{ color: '#6d3bff' }}>flux</span></span>
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#a0a0a0' }}>
              The next generation anime streaming platform. Premium content, beautiful experience.
            </p>
            <div className="flex gap-2">
              {['Discord', 'Twitter', 'Reddit'].map(s => (
                <button
                  key={s}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/10"
                  style={{ background: '#1b1d23', border: '1px solid #23252b', color: '#a0a0a0' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#a0a0a0' }}>{category}</p>
              <ul className="flex flex-col gap-2">
                {items.map(item => (
                  <li key={item}>
                    <button className="text-sm transition-colors hover:text-white" style={{ color: '#6b6b6b' }}>
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-6" style={{ borderColor: '#23252b' }}>
          <p className="text-xs" style={{ color: '#6b6b6b' }}>© 2026 Aniflux. All rights reserved. Not affiliated with any anime studio.</p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <button key={item} className="text-xs transition-colors hover:text-white" style={{ color: '#6b6b6b' }}>{item}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
