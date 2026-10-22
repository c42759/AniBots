import './globals.css';

export const metadata = {
    title: 'AniBots | Modular Tactical RPG & Open-Source Game Project',
    description:
        'AniBots is an open-source tactical RPG built in Godot 4.x featuring modular 5-part robots, autonomous Anima Chip AI cores, and persistent hardware degradation. Calling game devs, pixel artists, 3D animators, and UI designers!',
    keywords: [
        'AniBots',
        'Godot 4',
        'Open Source Game',
        'Tactical RPG',
        'Medabots',
        'Modular Robots',
        'Pixel Art',
        '3D Animation',
        'Game Development',
        'GDScript',
    ],
    authors: [{ name: 'AniBots Team', url: 'https://github.com/c42759/AniBots' }],
    openGraph: {
        title: 'AniBots | Open-Source Modular Tactical RPG in Godot 4',
        description:
            'Assemble modular machines, command autonomous AI souls. Calling game devs, pixel artists, 3D animators, and UI designers!',
        url: 'https://github.com/c42759/AniBots',
        siteName: 'AniBots',
        locale: 'en_US',
        type: 'website',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang='en' className='h-full antialiased' suppressHydrationWarning>
            <head>
                <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
                <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
                <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
                <link rel='manifest' href='/site.webmanifest' />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('anibots-theme');if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
                    }}
                />
            </head>
            <body className='min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-accent selection:text-white'>
                {children}
            </body>
        </html>
    );
}

