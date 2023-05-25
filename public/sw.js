self.addEventListener("notificationclick", (e) => {
    const { notification } = e;

    
    
    if (notification?.title === notification?.data?.color?.title) revealNotif(notification?.data);
    else colorNotif(notification?.data)
})



function colorNotif(card) {

    if (!card) return


    self?.registration?.showNotification(card?.color?.title || "error", {
        tag: "KaboomCard",
        body: "Click to reveal card.",
        data: card,
        icon: card?.circleIcon,
        actions: [{action: "", title: card?.name}]
    })



}


function revealNotif(card) {

    if (!card) return
    self.registration.showNotification(card?.name ? `${card.name}` : "error", {
        body: `${card?.description || ""}. (click to hide)`,
        tag: "KaboomCard",
        data: card,
        icon: card?.cardIcon
    })
}