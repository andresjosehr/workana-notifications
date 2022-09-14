console.log('Desde service worker');

self.addEventListener('push', e => {
    const data = e.data.json();
    console.log('Push recibido...');
    self.registration.showNotification(data.title, {
        body: data.message,
        icon: 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://workana.com&size=64'
    });
});