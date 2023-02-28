// ------------------------------------------ Authentication -------------------------------------------
let session_data = [];

const session = (username, password) => {
    session_data = [username, password];
    document.getElementById("table-auth").innerHTML = `<tr id="nav-auth" style="cursor: pointer;"><td id="guestBookTab" onclick="nav('guestBook')">Guest Book</td><td id="nav-spacer"> | </td><td onclick="logout()">Logout</td><td id="user"><em>(logged in as ${username})</em></td><tr>`;
}

// -------------------------------------------- Navigation ---------------------------------------------
const nav = (element) => {
    const tabs = [["homeTab","home"], ["shopTab","shop"], ["registrationTab","registration"], ["guestBookTab", "guestBook"], ["loginTab","login"], ["gameTab","game"]];
    
    tabs.forEach( (e) => {
        if (e[1] === element) {
            document.getElementById(e[1]).style.display="block";
            if (e[1] !== "registration" || e[1] !== "login") {
                document.getElementById(e[0]).style.borderBottom="2px solid white";
            }
        }
        else {
            document.getElementById(e[1]).style.display="none"
            if (e[1] !== "registration" && e[1] !== "login") {
                document.getElementById(e[0]).style.borderBottom="none"
            }
        }
    });
}

// --------------------------------------------- Home page ---------------------------------------------
const getVersion = () => {
    const fetchPromise = fetch('https://cws.auckland.ac.nz/gas/api/Version');
    const streamPromise = fetchPromise.then( (response) => response.text() );
    streamPromise.then( (data) => {
        document.getElementById("footer-version").innerHTML = `<p>A website design by Kyil067 | Version ${data}</p>`;
    });
}

getVersion();

// --------------------------------------------- Shop page ---------------------------------------------
const search_item = () => {
    let item_name = document.getElementById("item").value;
    item_name = item_name.replace(" ", "%20"); // replace all spaces with %20

    const fetchPromise = fetch(`https://cws.auckland.ac.nz/gas/api/Items/${item_name}`, 
        {
            headers: {
                "Accept" : "application/json",
            },
        }
    );
    const streamPromise = fetchPromise.then( (response) => response.json() );
    
    streamPromise.then( (data) => showDetails(data, "search-table", `id="search-result-name"`) );    
}

const getDetails = () => {
    const fetchPromise = fetch('https://cws.auckland.ac.nz/gas/api/AllItems', 
        {
            headers: {
                "Accept" : "application/json",
            },
        }
    );
    const streamPromise = fetchPromise.then( (response) => response.json() );
    
    streamPromise.then( (data) => showDetails(data, "shop-table") );
}

const showDetails = (orders, id, title_type="") => {
    // id, name, description, price
    let htmlString = "";

    if (title_type != "") {
        htmlString = `<p ${title_type}>${orders.length} result(s) were found.</p><br><br>`
    }
    const showOrder = (order) => {
        htmlString += `<tr><td> <img id="shop-image" alt="${order.name}" src="https://cws.auckland.ac.nz/gas/api/ItemPhoto/${order.id}"/> </td><td><b ${title_type}>${order.name}</b> | $${order.price}<br><br>${order.description}<br><br><p class="shop-button" onclick="purchase_item(${order.id})">Buy Now</p><div id="purchase-response-${order.id}"></div><p id="br-shop"></p></td></tr>`;
    }
    if (orders.length > 0) {
        orders.forEach(showOrder);
    }
    else {
        htmlString = "<p id='registration-response-error'>No orders were found for your search. Maybe try a different name?</p>";
    }

    const ourTable = document.getElementById(id);
    ourTable.innerHTML = htmlString;
}

getDetails();

const purchase_item = (id) => {
    if (session_data.length !== 0){
        const fetchPromise = fetch(`https://cws.auckland.ac.nz/gas/api/PurchaseItem/${id}`, 
            {
                headers: {
                    "Accept": "text/plain",
                    "Authorization": "Basic " + btoa(`${session_data[0]}:${session_data[1]}`),
                }
            }
        );

        const streamPromise = fetchPromise.then( (response) => response.text() );
        
        streamPromise.then( (data) => {
            const response_message = document.getElementById(`purchase-response-${id}`);
            response_message.innerHTML = `<p id="registration-response-success"><em>${session_data[0]} Successfully purchased</em><p>`;
        });
    }
    else {
        nav('login');
    }
}

// ----------------------------------------------- Game ------------------------------------------------
current_moves = "";
current_game = "";
chessboard_html = `<tbody>
                        <tr>
                            <th></th>
                            <th>a</th>
                            <th>b</th>
                            <th>c</th>
                            <th>d</th>
                            <th>e</th>
                            <th>f</th>
                            <th>g</th>
                            <th>h</th>
                            <th><img id="bin" ondrop="bin(event)" ondragover="drag_over(event)" src="https://cws.auckland.ac.nz/gas/images/Bin.svg"/></th>
                        </tr>
                        <tr>
                            <th>8</th>
                            <td id="a8" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Rb1" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Rb.svg" class="a8"/></td>
                            <td id="b8" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Nb1" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Nb.svg" class="b8"/></td>
                            <td id="c8" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Bb1" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Bb.svg" class="c8"/></td>
                            <td id="d8" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Qb0" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Qb.svg" class="d8"/></td>
                            <td id="e8" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Kb0" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Kb.svg" class="e8"/></td>
                            <td id="f8" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Bb2" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Bb.svg" class="f8"/></td>
                            <td id="g8" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Nb2" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Nb.svg" class="g8"/></td>
                            <td id="h8" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Rb2" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Rb.svg" class="h8"/></td>
                            <th>8</th>
                        </tr>
                        <tr>
                            <th>7</th>
                            <td id="a7" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pb1" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pb.svg" class="a7"/></td>
                            <td id="b7" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pb2" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pb.svg" class="b7"/></td>
                            <td id="c7" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pb3" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pb.svg" class="c7"/></td>
                            <td id="d7" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pb4" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pb.svg" class="d7"/></td>
                            <td id="e7" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pb5" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pb.svg" class="e7"/></td>
                            <td id="f7" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pb6" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pb.svg" class="f7"/></td>
                            <td id="g7" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pb7" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pb.svg" class="g7"/></td>
                            <td id="h7" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pb8" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pb.svg" class="h7"/></td>
                            <th>7</th>
                        </tr>
                        <tr>
                            <th>6</th>
                            <td id="a6" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="b6" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="c6" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="d6" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="e6" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="f6" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="g6" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="h6" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <th>6</th>
                        </tr>
                        <tr>
                            <th>5</th>
                            <td id="a5" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="b5" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="c5" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="d5" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="e5" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="f5" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="g5" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="h5" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <th>5</th>
                        </tr>
                        <tr>
                            <th>4</th>
                            <td id="a4" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="b4" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="c4" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="d4" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="e4" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="f4" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="g4" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="h4" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <th>4</th>
                        </tr>
                        <tr>
                            <th>3</th>
                            <td id="a3" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="b3" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="c3" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="d3" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="e3" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="f3" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="g3" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <td id="h3" ondrop="drop(event)" ondragover="drag_over(event)"></td>
                            <th>3</th>
                        </tr>
                        <tr>
                            <th>2</th>
                            <td id="a2" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pw1" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pw.svg" class="a2"/></td>
                            <td id="b2" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pw2" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pw.svg" class="b2"/></td>
                            <td id="c2" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pw3" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pw.svg" class="c2"/></td>
                            <td id="d2" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pw4" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pw.svg" class="d2"/></td>
                            <td id="e2" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pw5" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pw.svg" class="e2"/></td>
                            <td id="f2" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pw6" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pw.svg" class="f2"/></td>
                            <td id="g2" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pw7" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pw.svg" class="g2"/></td>
                            <td id="h2" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Pw8" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Pw.svg" class="h2"/></td>
                            <th>2</th>
                        </tr>
                        <tr>
                            <th>1</th>
                            <td id="a1" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Rw1" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Rw.svg" class="a1"/></td>
                            <td id="b1" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Nw1" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Nw.svg" class="b1"/></td>
                            <td id="c1" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Bw1" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Bw.svg" class="c1"/></td>
                            <td id="d1" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Qw0" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Qw.svg" class="d1"/></td>
                            <td id="e1" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Kw0" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Kw.svg" class="e1"/></td>
                            <td id="f1" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Bw2" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Bw.svg" class="f1"/></td>
                            <td id="g1" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Nw2" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Nw.svg" class="g1"/></td>
                            <td id="h1" ondrop="drop(event)" ondragover="drag_over(event)"><img id="Rw2" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/Rw.svg" class="h1"/></td>
                            <th>1</th>
                        </tr>
                        <tr>
                            <th><img id="bin" ondrop="bin(event)" ondragover="drag_over(event)" src="https://cws.auckland.ac.nz/gas/images/Bin.svg"/></th>
                            <th>a</th>
                            <th>b</th>
                            <th>c</th>
                            <th>d</th>
                            <th>e</th>
                            <th>f</th>
                            <th>g</th>
                            <th>h</th>
                            <th></th>
                        </tr>
                        </tbody>`;

const initialise_game = () => {
    if (session_data.length !== 0) {
        document.getElementById("chessboard-table").innerHTML = chessboard_html;
        document.getElementById("play-button").style.display="none";

        // response options: gameId, state ("wait" or "progress"), player1, player2, lastMovePlayer1, lastMovePlayer2
        const fetchPromise = fetch(`https://cws.auckland.ac.nz/gas/api/PairMe`, {
            headers: {
                "Accept" : "text/plain",
                "Authorization": "Basic " + btoa(`${session_data[0]}:${session_data[1]}`)
            },
        });

        const streamPromise = fetchPromise.then( (response) => response.json() ); // convert to json?
        
        streamPromise.then( (data) => 
            {
                if (data.state === "wait") {
                    document.getElementById("game-state").innerHTML = `<p>Could not be pair with another player at this time. <a onclick="initialise_game(); document.getElementById('chessboard-table').innerHTML = chessboard_html; style='cursor: pointer;'">Click here to refresh</a> - or practice on the chessboard below</p>`;
                    document.getElementById("game-buttons").style.display = "none";
                }
                else {
                    document.getElementById("game-buttons").style.display = "block";

                    document.getElementById("game-heading").innerHTML = `<p><b>${data.player1}</b> VS <b>${data.player2}</b></p>`;
                    document.getElementById("game-state").innerHTML = `<p><b>Player 1</b> (${data.player1}) is playing whites | <b>Player 2</b> (${data.player2}) is playing blacks</p>`;
                    current_game = data.gameId;

                    if (session_data[0] === data.player1) { // Player1 (whites) gets first move
                        document.getElementById("submit-move").style.display = "block"; // show the submit moves button
                        document.getElementById("get-move").style.display = "none"; // hide the get move button
                    }
                    else { // Player 2 (blacks) gets second move
                        document.getElementById("submit-move").style.display = "none"; // hide the submit moves button
                        document.getElementById("get-move").style.display = "block"; // show the get move button
                    }
                }
            }
        );

        document.getElementById("chess-game").style.display="block";
        
    }
    else {
        nav('login');
    }
}

const drag_over = (ev) => {
    ev.preventDefault();
}

const drag_start = (ev) => {
    ev.dataTransfer.setData("text/plain", ev.target.id);
} 

const drop = (ev) => {
    if (ev.dataTansfer !== null) {
        const piece_id = ev.dataTransfer.getData("text/plain");
        if (ev.target.id != piece_id){

            current_moves += `${piece_id}-${ev.target.id},`;

            bin(ev);
            
            // Convert pawns to queens if they reach the end.
            if (piece_id.slice(0, -1) === "Pw" && (ev.target.id).slice(1) === "8") {
                document.getElementById(ev.target.id).outerHTML = `<td id="${ev.target.id}" ondrop="drop(event)" ondragover="drag_over(event)"><img id="kw${piece_id.slice(2,)}" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/kw.svg" class="${ev.target.id}"/></td>`;
            }

            else if (piece_id.slice(0, -1) === "Pb" && (ev.target.id).slice(1) === "1") {
                document.getElementById(ev.target.id).outerHTML = `<td id="${ev.target.id}" ondrop="drop(event)" ondragover="drag_over(event)"><img id="kb${piece_id.slice(2,)}" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/kb.svg" class="${ev.target.id}"/></td>`;
            }

            else {
                document.getElementById(ev.target.id).outerHTML = `<td id="${ev.target.id}" ondrop="drop(event)" ondragover="drag_over(event)"><img id="${piece_id}" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/${piece_id.slice(0, -1)}.svg" class="${ev.target.id}"/></td>`;
            }
        }
    }
}

const bin = (ev) => {
    const piece_id = ev.dataTransfer.getData("text/plain");
    document.getElementById(piece_id).remove();
}

const submit_move = () => {
    if (current_moves.length > 0) {
        const my_move = {
            "gameId": current_game,
            "move": current_moves,
        }

        fetch(`https://cws.auckland.ac.nz/gas/api/MyMove`, 
            {
                method: "POST",
                headers: {
                    "Accept" : "text/plain", 
                    "Content-Type" : "application/json",
                    "Authorization": "Basic " + btoa(`${session_data[0]}:${session_data[1]}`),
                },
                body: JSON.stringify(my_move),
            }
        );
        current_moves = ""; // reset current moves
        document.getElementById("submit-move").style.display = "none"; // hide the submit moves button
        document.getElementById("get-move").style.display = "block"; // show the get move button
    }
    else {
        alert("You haven't made a move.");
    }
}

const get_next_move = () => {
    const fetchPromise = fetch(`https://cws.auckland.ac.nz/gas/api/TheirMove?gameId=${current_game}`, {
        headers: {
            "Accept" : "text/plain", 
            "Authorization": "Basic " + btoa(`${session_data[0]}:${session_data[1]}`),
        },
    });

    const streamPromise = fetchPromise.then( (response) => response.text() );

    streamPromise.then( (data) => {
        if (data === "") {
            alert("Opponent has made no moves yet.");
        }
        else {
            update(data.split(','));
            document.getElementById("submit-move").style.display = "block"; // show the submit moves button
            document.getElementById("get-move").style.display = "none"; // hide the get move button
        }
    });
}

const update = (moves) => {
    for (m = 0; m < moves.length - 1; m++) {
        move = moves[m].split('-');
        piece_id = move[0]; 
        element_id = move[1];

        // bin the previous place the piece was in:
        document.getElementById(piece_id).remove();
    
        // convert any pawns to queens if they reach the end.
        if (piece_id.slice(0, -1) === "Pw" && (element_id).slice(1) === "8") {
            document.getElementById(element_id).outerHTML = `<td id="${element_id}" ondrop="drop(event)" ondragover="drag_over(event)"><img id="kw${piece_id.slice(2,)}" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/kw.svg" class="${element_id}"/></td>`;
        }

        else if (piece_id.slice(0, -1) === "Pb" && (element_id).slice(1) === "1") {
            document.getElementById(element_id).outerHTML = `<td id="${element_id}" ondrop="drop(event)" ondragover="drag_over(event)"><img id="kb${piece_id.slice(2,)}" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/kb.svg" class="${element_id}"/></td>`;
        }

        else {
            document.getElementById(element_id).outerHTML = `<td id="${element_id}" ondrop="drop(event)" ondragover="drag_over(event)"><img id="${piece_id}" ondragstart="drag_start(event)" draggable="true" src="https://cws.auckland.ac.nz/gas/images/${piece_id.slice(0, -1)}.svg" class="${element_id}"/></td>`;
        }
    }
}

const quit_game = () => {
    fetch(`https://cws.auckland.ac.nz/gas/api/QuitGame?gameId=${current_game}`, {
        headers: {
            "Accept" : "text/plain",
            "Authorization": "Basic " + btoa(`${session_data[0]}:${session_data[1]}`)
        },
    });
    document.getElementById("game-state").innerHTML = "<p>Game over</p>";

    document.getElementById("play-button").style.display="block";
    document.getElementById("chess-game").style.display="none";
    document.getElementById("game-heading").style.display="none";

    // refresh board
    document.getElementById("chessboard-table").innerHTML = chessboard_html;
}

// -------------------------------------------- Guest Book ---------------------------------------------
const write_comment = () => {
    let comment = document.getElementById("comment").value;
    let name = document.getElementById("name").value;

    const user_comment = {
        "comment": comment,
        "name": name,
    }

    fetch(`https://cws.auckland.ac.nz/gas/api/Comment`, 
        {
            method: "POST",
            headers: {
                "Accept" : "text/plain", 
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(user_comment),
        }
    );

    get_comments();
}

const get_comments = () => {
    document.getElementById("comments-frame").src = document.getElementById("comments-frame").src
}

// ----------------------------------------------- Login -----------------------------------------------
const login = () => {
    const username = document.getElementById("username-login").value;
    const password = document.getElementById("password-login").value;

    fetch('https://cws.auckland.ac.nz/gas/api/VersionA', {
        method: "GET",
        headers: {
            "Accept" : "text/plain",
            "Content-Type": "text/plain",
            "Authorization": "Basic " + btoa(`${username}:${password}`),
        },
    }).then( (response) => {
        if (!response.ok) {
            throw new Error(response.status)
        }  
        else {
            document.getElementById("login-response").innerHTML = `<p id="registration-response-success">Successfully logged in</p><p><b>Welcome back, ${username}</b></p>`;
            document.getElementById("login-form").style.display="none";
            session(username, password);
        }
    }).catch( (error) => {
        document.getElementById("login-response").innerHTML = '<p id="registration-response-error">Username or password incorrect.</p>';
    });
}

const logout = () => {
    session_data = []
    location.reload();
}

// -------------------------------------------- Registration -------------------------------------------
const register = () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    let address = document.getElementById("address").value;

    let new_user;

    if (address == "") {
        new_user = {
            username: username,
            password: password,
        }
    }

    else {
        new_user = {
            username: username,
            password: password,
            address: address,
        }
    }

    fetch('https://cws.auckland.ac.nz/gas/api/Register', {
        method: "POST",
        headers: {
            "Accept" : "text/plain",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(new_user),
    }).then( (response) => response.text() ).then( (data) => {
        if (data == `User ${username} registered` ){
            document.getElementById("registration-response").innerHTML = `<p id="registration-response-success"><b>${data}</b></p><br><button class="shop-button" onclick="nav('login')">Login</button>`;
            document.getElementById("registration-form").style.display="none";
        } else {
            document.getElementById("registration-response").innerHTML = `<p id="registration-response-error"><em>${data}</em></p>`;
        }
    }).catch( (error) => {response_message.innerHTML = "Username and password are required."} );
}
