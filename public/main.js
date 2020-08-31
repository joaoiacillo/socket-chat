let activeChannel = "";

$(function () {
    const socket = io();

    /**
     * Returns a JQuery HTML element built from a message query.
     */
    function getMessageElementFromQuery(query) {
        let el = $("<li>").addClass("message-block");

        el.append([
            // Message Author
            $("<h4>").addClass("message-author").text(query.author).append(
                // Message Time
                $("<span>").addClass("message-time").text(query.at)
            ),
            $("<p>").addClass("message-content").text(query.content),
        ]);

        return el;
    }

    /**
     * Renders a message query as a HTML element.
     * @param {Object} query
     */
    function renderMessageQuery(query) {
        if (query.author == socket.id) query.author = "YOU";
        let messageElement = getMessageElementFromQuery(query);
        $("#message-list").append(messageElement);
        messageElement[0].scrollIntoView();
    }

    // Renders each cached message
    socket.on("cached", function (messages) {
        for (let message of messages) {
            renderMessageQuery(message);
        }
    });

    socket.on("message", function (query) {
        renderMessageQuery(query);
    });

    $("#message-form").submit(function (event) {
        event.preventDefault();

        /**
         * Returns a string template from a Date object.
         * @param {Date} date
         */
        function makeDateStringFromDate(date) {
            // day/month/year hour/minutes
            // e.g. 15/08/2020 13:53

            let string = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
            return string;
        }

        const messageQuery = {
            author: socket.id,
            at: makeDateStringFromDate(new Date()),
            content: $('input[name="message-content"]').val(),
        };

        socket.emit("message", messageQuery);

        renderMessageQuery(messageQuery);
        $('input[name="message-content"]').val("");
    });
});
