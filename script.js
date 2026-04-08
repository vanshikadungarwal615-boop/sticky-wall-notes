let notes = JSON.parse(localStorage.getItem("notes")) || [];

const defaultColors = ["#FFEB3B", "#FFCDD2", "#C8E6C9", "#BBDEFB", "#E1BEE7"];

function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

function renderNotes() {
    const container = document.getElementById("notesContainer");
    container.innerHTML = "";

    notes.forEach((note, index) => {
        const div = document.createElement("div");
        div.className = "note";
        div.style.background = note.color;
        div.draggable = true;

        div.innerHTML = `
            <span class="pin" onclick="pinNote(${index})">📌</span>
            <span class="delete" onclick="deleteNote(${index})">❌</span>
            <p>${note.text}</p>
            <div class="timestamp">${note.time}</div>
        `;

        // Edit
        div.addEventListener("dblclick", () => {
            const newText = prompt("Edit note:", note.text);
            if (newText && newText.trim() !== "") {
                notes[index].text = newText.trim();
                notes[index].time = new Date().toLocaleString();
                saveNotes();
                renderNotes();
            }
        });

        // Drag
        div.addEventListener("dragstart", () => {
            div.classList.add("dragging");
        });

        div.addEventListener("dragend", () => {
            div.classList.remove("dragging");

            const newNotes = [];
            document.querySelectorAll(".note").forEach(noteDiv => {
                const text = noteDiv.querySelector("p").innerText;
                const found = notes.find(n => n.text === text);
                newNotes.push(found);
            });

            notes = newNotes;
            saveNotes();
        });

        container.appendChild(div);
    });
}

// Add
function addNote() {
    const text = document.getElementById("noteInput").value.trim();
    const color = document.getElementById("colorPicker").value;

    if (!text) return alert("Empty note not allowed");
    if (notes.length >= 20) return alert("Max 20 notes");

    notes.push({
        text,
        color: color || defaultColors[Math.floor(Math.random() * defaultColors.length)],
        time: new Date().toLocaleString()
    });

    document.getElementById("noteInput").value = "";
    saveNotes();
    renderNotes();
}

// Delete
function deleteNote(index) {
    notes.splice(index, 1);
    saveNotes();
    renderNotes();
}

// Pin
function pinNote(index) {
    const note = notes.splice(index, 1)[0];
    notes.unshift(note);
    saveNotes();
    renderNotes();
}

// Drag container
const container = document.getElementById("notesContainer");

container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(container, e.clientY);

    if (afterElement == null) {
        container.appendChild(dragging);
    } else {
        container.insertBefore(dragging, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll(".note:not(.dragging)")];

    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Search
function searchNotes() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    document.querySelectorAll(".note").forEach(note => {
        note.style.display = note.innerText.toLowerCase().includes(query) ? "block" : "none";
    });
}

// Dark mode
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("dark", document.body.classList.contains("dark"));
}

if (localStorage.getItem("dark") === "true") {
    document.body.classList.add("dark");
}

// Load
renderNotes();