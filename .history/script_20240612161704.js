var apiUrl = "https://api.mepuzz.com/v1/";
function saveReceiveCount(t) {
    var n;
    (t += 1),
        saveToIndexedDB({
            id: "max_receive_day_count",
            value: formatToDate(new Date()) + "|" + t,
        });
}
function showErrorNotification() {
    var t, n;
    return self.registration.showNotification("Oops! Something went wrong.", {
        body: "Sorry, the content wasn't delivered appropriately.",
        tag: "insider-notification-error",
    });
}
function formatToDate(t) {
    var n = t.getFullYear();
    let e = t.getMonth() + 1,
        o = t.getDate();
    return (
        1 === e.toString().length && (e = "0" + e),
        1 === o.toString().length && (o = "0" + o),
        `${n}-${e}-` + o
    );
}
function loadFromIndexedDB(c) {
    let d = "mePuzzDb";
    return new Promise(function (a, r) {
        var t = indexedDB.open(d);
        (t.onerror = function (t) {
            r(Error("Error text"));
        }),
            (t.onupgradeneeded = function (t) {
                t.target.transaction.abort(), r(Error("Not found"));
            }),
            (t.onsuccess = function (t) {
                var n,
                    e,
                    o,
                    i = t.target.result.transaction([d]).objectStore(d).get(c);
                (i.onerror = function (t) {
                    r(Error("Error text"));
                }),
                    (i.onsuccess = function (t) {
                        i.result
                            ? a(i.result.value)
                            : r(Error("object not found"));
                    });
            });
    });
}
function saveToIndexedDB(r) {
    let c = "mePuzzDb";
    return new Promise(function (i, a) {
        void 0 === r.id && a(Error("object has no id."));
        var t = indexedDB.open(c);
        (t.onerror = function (t) {
            a(Error("IndexedDB database error"));
        }),
            (t.onupgradeneeded = function (t) {
                var n,
                    e = t.target.result.createObjectStore(c, { keyPath: "id" });
            }),
            (t.onsuccess = function (t) {
                var n,
                    e,
                    o,
                    t = t.target.result
                        .transaction([c], "readwrite")
                        .objectStore(c)
                        .put(r);
                (t.onerror = function (t) {
                    a(Error("Error text"));
                }),
                    (t.onsuccess = function (t) {
                        i("Data saved OK");
                    });
            });
    });
}
self.addEventListener("push", function (t) {
    let n = {},
        a = (t.data && (n = t.data.json()), ""),
        r = {},
        o = "",
        i = "";
    if (void 0 !== n.notification_id)
        (a = n.title),
            (o = n.notification_id),
            (r = {
                body: n.body,
                icon: n.icon,
                data: { url: n.url, notif_id: n.notification_id },
                tag: n.notification_id,
                requireInteraction: !0,
            }),
            n.image && 0 < n.image.length && (r.image = n.image);
    else if (void 0 !== n.data) {
        let t = {};
        void 0 !== n.data.actions &&
            (t = JSON.parse(n.data.actions.replace(/'/g, '"'))),
            (a = n.data.title),
            (o = n.data.notif_id),
            (i = n.data.product_id),
            (r = {
                body: n.data.body,
                icon: n.data.icon,
                dir: "ltr",
                tag: n.data.tag,
                data: {
                    url: n.data.click_action,
                    actions: t,
                    notif_id: n.data.notif_id,
                    product_id: n.data.product_id,
                },
                actions: t,
                requireInteraction: n.data.requireInteraction,
            }),
            n.data &&
                n.data.image &&
                0 < n.data.image.length &&
                (r.image = n.data.image);
    }
    if (0 < a.length && r) {
        let n = apiUrl + "track-notif?notif=" + o,
            e =
                (i && 0 < i.length && (n += "&product_id=" + i),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json;charset=UTF-8",
                        "Access-Control-Allow-Origin": "*",
                    },
                    cache: "no-cache",
                    mode: "no-cors",
                    body: JSON.stringify({ notif_id: o, action: "view" }),
                });
        var c = function () {
            loadFromIndexedDB("mepuzzId")
                .then(function (t) {
                    (n += "&mepuzzId=" + t),
                        loadFromIndexedDB("token")
                            .then(function (t) {
                                (n += "&token=" + t), fetch(n, e);
                            })
                            .catch(function (t) {
                                fetch(n, e);
                            });
                })
                .catch(function (t) {
                    fetch(n, e);
                });
        };
        loadFromIndexedDB("max_receive")
            .then(function (i) {
                loadFromIndexedDB("max_receive_day_count")
                    .then(function (t) {
                        var n = formatToDate(new Date()),
                            e;
                        let o = 0;
                        (t &&
                            0 < t.length &&
                            ((e = t.split("|")[0]),
                            (o = parseInt(t.split("|")[1])),
                            n === e) &&
                            null !== e &&
                            0 !== e.length &&
                            (void 0 !== e || "undefined" === evtstatic)) ||
                            (o = 0),
                            (i && o && 0 < i && 0 < o && !(i > o)) ||
                                (self.registration.showNotification(a, r),
                                saveReceiveCount(o),
                                c());
                    })
                    .catch(function (t) {
                        saveReceiveCount(0),
                            self.registration.showNotification(a, r),
                            c();
                    });
            })
            .catch(function (t) {
                saveReceiveCount(0),
                    self.registration.showNotification(a, r),
                    c();
            });
    }
}),
    self.addEventListener("notificationclick", function (t) {
        t.notification.close();
        let n = t.notification.data.url,
            e =
                ("insider-primary-action" === t.action &&
                    (n = t.notification.data.actions[0].url),
                "insider-secondary-action" === t.action &&
                    (n = t.notification.data.actions[1].url),
                apiUrl + "track-notif?notif=" + t.notification.data.notif_id),
            o =
                (t.notification.data.product_id &&
                    0 < t.notification.data.product_id.length &&
                    (e += "&product_id=" + t.notification.data.product_id),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json;charset=UTF-8",
                        "Access-Control-Allow-Origin": "*",
                    },
                    cache: "no-cache",
                    mode: "no-cors",
                    body: JSON.stringify({
                        notif_id: t.notification.data.notif_id,
                        action: "click",
                    }),
                });
        loadFromIndexedDB("mepuzzId")
            .then(function (t) {
                (e += "&mepuzzId=" + t),
                    loadFromIndexedDB("token")
                        .then(function (t) {
                            (e += "&token=" + t), fetch(e, o);
                        })
                        .catch(function (t) {
                            fetch(e, o);
                        });
            })
            .catch(function (t) {
                fetch(e, o);
            }),
            t.waitUntil(Promise.all([self.clients.openWindow(n)]));
    }),
    self.addEventListener("install", function (t) {
        t.waitUntil(self.skipWaiting());
    }),
    self.addEventListener("activate", function (t) {
        t.waitUntil(self.clients.claim());
    });
