const { createApp } = Vue

createApp({
    data() {
        return {
            message: 'Hello Vue!',
        }
    },
    components: {
        navbar: Navbar,
    },
}).mount('#app')
