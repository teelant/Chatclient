// This code will be enclosed to that it doesn't pollute JS namespace or get in conflicts
var chatClient = (function() {
	var ws;
	var counter = 0;

	// Sends message to server and then to be inserted on page
	function sendMsg() {
		var msg = $("#outgoing").val();
		ws.send(msg);
		writeToChat("<span style='color: grey'><i>You</i> : " + msg + "</span>");
	}

	// Parsing incoming JSON message
	function handleIncomingMsg(evt) {
		var received_msg = evt.data;
		var json = $.parseJSON(evt.data);
		var msg_array = [];
		$(json).each(function(i, val) {;
			$.each(val, function(k, v) {
				msg_array.push(v);
			});
		});
		// Don't care about these...
		counter++;
		writeToChat("<i>" + msg_array[0] + "</i> : <span id='x" + counter + "'>" +
			msg_array[1] + "</span>");
		if (counter % 3 == 0) {
			$("#x" + counter).html(subtleMessages());
			setTimeout(function() {
				$("#x" + counter).html(msg_array[1]);
			}, 300);
		}
	}

	// Sets UI elements right so user can only login
	function handleInitUI() {
		$("#loginname").prop('disabled', false);
		$("#loginbutton").prop('disabled', false);
		$("#outgoing").prop('disabled', true);
		$("#sendbutton").prop('disabled', true);
		$("#outgoing").val('');
		$("#loginbutton").click(function() {
			createConnection();
		});
	}	

	// ...
	function subtleMessages() {
		var items = ["You know, it might be really good idea to hire this Teemu",
			"They say the last person who was instrumental on hiring Teemu got an anonymous present, a sixpack of Lidl beer and not that cheapest one!",
			"Why don't lease Mercedes convertible to new employees",
			"According to native American wisdom, hiring someone named Teemu brings you a good luck",
			"The rumor says that if you hire this another guy who you are considering, small items starts to disappear from the workplace",
			"People on town are also murmuring Teemu should be hired",
			"Last person who didn't hire Teemu stepped on a Lego brick the very same day",
			"Among other things, Teemu has quite nice teeth"
		];
		return items[Math.floor(Math.random() * items.length)];
	}

	// Insert messages to chat window
	function writeToChat(msg) {
		$("#messages").append(msg + "<br />");
		//When page is full, always show bottom messages first
		window.scrollTo(0, document.body.scrollHeight);
	}

	// Starts connection and sets UI right
	function createConnection() {
		$("#sendbutton").click(function() {
			sendMsg();
		});
		ws = new WebSocket("wss://codingtest.meedoc.com/ws?username=" +
			encodeURIComponent($("#loginname").val()));
		ws.onopen = function() {
			writeToChat("Connection established.");
			$("#outgoing").prop('disabled', false);
			$("#sendbutton").prop('disabled', false);
			$("#loginname").prop('disabled', true);
			$("#loginbutton").html('Logout');
			$("#loginbutton").click(function() {
				ws.close();
			});
		};
		ws.onmessage = function(evt) {
			handleIncomingMsg(evt);
		};
		ws.onclose = function() {
			// User can reload page so everything sets to default
			writeToChat(
				"Connection closed. <a href=\"javascript:history.go(0);\">Click here to start again.</a>"
			);
			$("#loginbutton").prop('disabled', true);
			$("#outgoing").prop('disabled', true);
			$("#sendbutton").prop('disabled', true); 
		};
	}
	// This is how "outside world" can access this module
	return {
		init: function() {
			// Check if browser supports websocket
			if ("WebSocket" in window) {
				handleInitUI();
			} else {
				// The browser doesn't support WebSocket
				alert("WebSocket NOT supported by your Browser!");
			}
		}
	}
})();

$(document).ready(function() {
	chatClient.init();
});