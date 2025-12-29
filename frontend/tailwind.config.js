/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#e6f2ff',
                    100: '#cce5ff',
                    200: '#99cbff',
                    300: '#66b0ff',
                    400: '#3396ff',
                    500: '#007bff',
                    600: '#0062cc',
                    700: '#004a99',
                    800: '#003166',
                    900: '#001933',
                },
                ocean: {
                    50: '#e6f7ff',
                    100: '#b3e5ff',
                    200: '#80d4ff',
                    300: '#4dc2ff',
                    400: '#1ab1ff',
                    500: '#009fdf',
                    600: '#007db3',
                    700: '#005c86',
                    800: '#003a5a',
                    900: '#00192d',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.6s ease-out',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(30px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
}
