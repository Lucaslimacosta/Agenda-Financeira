// Service Worker desabilitado - não usar cache

// Evento de push
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Notificação';
    const options = {
        body: data.body || 'Você tem uma nova notificação.',
        icon: data.icon || '/default-icon.png', // Substitua pelo caminho do ícone padrão
        data: data.url || '/' // URL para abrir ao clicar na notificação
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Evento de clique na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
            const client = clientsArr.find((client) => client.url === urlToOpen && 'focus' in client);
            if (client) {
                return client.focus();
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});