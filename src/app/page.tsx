import Image from "next/image";

export default function Home() {
  return (
    <div className='min-h-screen bg-background'>
      <nav className='flex items-center justify-between px-6 py-4 max-w-7xl mx-auto'>
        <div className='text-2xl font-bold text-gray-900'>ChatWithMe</div>
        <div className='flex gap-4 items-center'>
          <a href='/chat/login' className='text-gray-600 hover:text-gray-900 font-medium transition'>
            Log In
          </a>
          <a
            href='/chat/login'
            className='bg-primary text-white px-4 py-2 rounded-full font-medium hover:bg-primary-dark transition'
          >
            Get Started
          </a>
        </div>
      </nav>

      <main className='max-w-7xl mx-auto px-6 py-20'>
        <div className='mb-16'>
          <div className='grid md:grid-cols-2 gap-4 mb-16'>
            <div className=''>
              <h1 className='text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight'>
                Connect instantly,
                {/* <br /> */}
                <span className='text-primary'> chat seamlessly</span>
              </h1>
            </div>
            <div className=''>
              <Image src='/h2.gif' alt='' width={500} height={500} />
            </div>
          </div>
          <div className='text-center'>
            <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
              A modern messaging experience designed for real-time conversations. Start chatting in seconds
              with our beautiful, intuitive interface.
            </p>
            <div className='flex gap-4 justify-center'>
              <a
                href='/chat/login'
                className='bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition shadow-lg shadow-primary/20'
              >
                Start Chatting
              </a>
              <a
                href='#features'
                className='bg-white text-gray-700 px-8 py-3 rounded-full font-semibold border border-gray-200 hover:border-gray-300 transition'
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        <div id='features' className='grid md:grid-cols-3 gap-8 mb-20'>
          <div className='bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition'>
            <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4'>
              <svg className='w-6 h-6 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>Real-time Messaging</h3>
            <p className='text-gray-600'>
              Messages appear instantly with live updates. No refresh needed, just pure seamless conversation
              flow.
            </p>
          </div>

          <div className='bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition'>
            <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4'>
              <svg className='w-6 h-6 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>Group Conversations</h3>
            <p className='text-gray-600'>
              Create group chats with multiple participants. Perfect for teams, friends, and family
              discussions.
            </p>
          </div>

          <div className='bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition'>
            <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4'>
              <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>Secure & Private</h3>
            <p className='text-gray-600'>
              Your conversations are protected with secure authentication. Your privacy is our top priority.
            </p>
          </div>
        </div>

        <div className='bg-white rounded-3xl p-12 shadow-sm border border-gray-100 mb-20'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>Beautiful, intuitive design</h2>
              <p className='text-gray-600 mb-6'>
                Built with modern design principles, our chat interface is clean, responsive, and a joy to
                use. Whether you&apos;re on desktop or mobile, the experience is perfectly tailored for your
                device.
              </p>
              <ul className='space-y-3'>
                {[
                  "Responsive design for all devices",
                  "Smooth animations and transitions",
                  "Dark mode support",
                  "Accessible to everyone",
                ].map((feature) => (
                  <li key={feature} className='flex items-center gap-2 text-gray-700'>
                    <svg
                      className='w-5 h-5 text-primary'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className='bg-gray-50 rounded-2xl p-6 border border-gray-200'>
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4'>
                <div className='flex items-center gap-3 mb-3'>
                  <div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold'>
                    JD
                  </div>
                  <div>
                    <div className='font-medium text-gray-900'>John Doe</div>
                    <div className='text-xs text-gray-500'>Online</div>
                  </div>
                </div>
                <div className='bg-gray-100 rounded-lg p-3 text-sm text-gray-700'>
                  Hey! How are you doing?
                </div>
              </div>
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4 ml-8'>
                <div className='bg-[#d9fdd3] rounded-lg p-3 text-sm text-gray-900'>
                  I&apos;m great, thanks for asking! 🎉
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='text-center mb-20'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Ready to get started?</h2>
          <p className='text-gray-600 mb-8 max-w-xl mx-auto'>
            Join thousands of users already enjoying seamless communication. Sign up now and start your first
            conversation in seconds.
          </p>
          <a
            href='/chat/login'
            className='inline-block bg-[#00a884] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#008f72] transition shadow-lg shadow-[#00a884]/20'
          >
            Start Chatting Now
          </a>
        </div>
      </main>

      <footer className='bg-white border-t border-gray-200 py-8'>
        <div className='max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm'>
          © 2026 ChatWithMe. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
