module.exports = {
    shareRequest: (reqTo, reqFrom, portfolioName, LINK) => {
        const message = `
        <p>
        Hello, <b>${reqTo}</b>
        </P>

        <p> 
        One of our user i.e. <b>${reqFrom}</b> has a sharing-request 
        for your portfolio named <b>${portfolioName}</b>. <br>
        To grant access, please click on this <b><a href="${LINK}">LINK</a></b> <br> 
        </p>
        
        <p>
        <i> Please do not reply to this mail.</i> <br>
        </p>

        <p>
        Regards, <br>
        <b>Team SMAP</b> <br>
        </p>
        `;
        return message;
    },
    grantShareRequest: (reqTo, reqFrom, portfolioName) => {
        const message = `
        <p>
        Hello, <b>${reqFrom}</b> 
        </p>

        <p>
        <i>Greetings from SMAP.</i> <br>
        Fortunately, <b>${reqTo}</b> has granted your share-request to 
        the portfolio named <b>${portfolioName}</b>. <br>
        </p>

        <p>
        <i> Please do not reply to this mail.</i> <br>
        </p>

        <p>
        Regards, <br>
        <b>Team SMAP</b> <br>
        </p>
        `;
        return message;
    }
};