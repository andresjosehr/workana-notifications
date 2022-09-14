console.log('Desde service worker');

self.addEventListener('push', async e => {
    const data = e.data.json();
    self.registration.showNotification(data.title, {
        body: data.message,
        icon: 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://workana.com&size=64',
        data: {
            link: data.link
        }
    });

});

self.addEventListener('notificationclick', async function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.link)
    );
});