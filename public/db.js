let db;
const request = indexDB.open("budget", 1);

request.offlinedata = function(event){
    const db = event.target.result;
    db.createObjectStore("data", {autoIncrement: true});

};

request.onsucess = function(event){
    db = event.target.result;

    if (navigator.online){
        checkDatabase();
    }
};

request.onerror = function(event){
    console.log(`Error: ${event.target.errorCode}`);
};

function saver (record){
    const transaction = db.transaction(["data"], "readwrite");
    const store = transaction.objectStore("data");
    store.add(record)
};

function checkDatabase() {

    const transaction = db.transaction(["data"], "readwrite");

    const store = transaction.objectStore("data");

    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then(() => {

          const transaction = db.transaction(["data"], "readwrite");
  
          const store = transaction.objectStore("data");
  
          store.clear();
        });
      }
    };
  }
  
  window.addEventListener("online", checkDatabase);