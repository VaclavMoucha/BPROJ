fetch("/html/header.html")
    .then((response) => response.text())
    .then((data) => {
        document.getElementById("header").innerHTML = data;
        initHeader();
    })
    .catch((error) => {
        console.error("Error loading header:", error);
    });

fetch("/html/footer.html")
    .then((response) => response.text())
    .then((data2) => {
        document.getElementById("footer").innerHTML = data2;
    })
    .catch((error) => {
        console.error("Error loading footer:", error);
    });


