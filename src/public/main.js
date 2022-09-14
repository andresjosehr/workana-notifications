(async() =>{
  let PUBLIC_VAPID_KEY;

  const getPublicVapidKey = async () => {
    await fetch('/get-public-vapid-key')
      .then(res => res.json())
      .then(data => {
        PUBLIC_VAPID_KEY = data.publicVapidKey;
      });
  }
    
  const subscription = async() => {

    // Service worker
    const register = await navigator.serviceWorker.register('/worker.js', {
      scope: '/'
    });

    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
    })

    await fetch('/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        machineKey: window.localStorage.getItem('machineKey'),
        subscription
      }),
      headers: {
        'content-type': 'application/json'
      }
    })
  }
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  const keyIdentifier = () => {
    if(window.localStorage.getItem('machineKey')) {
      return;
    }
    const key = [...Array(50)].map(() => Math.random().toString(36)[2]).join('');
    window.localStorage.setItem('machineKey', key);
  };

  keyIdentifier();
  await getPublicVapidKey();
  await subscription();
})()