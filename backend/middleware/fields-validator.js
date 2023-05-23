
module.exports = (req, res, next) => {
    const emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
    // const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;

    let userEmail = req.body.email;
    // let userPassword = req.body.password;

    if (emailRegex.test(userEmail) == true) {
        // if (passwordRegex.test(userPassword) == true) {
        next();
        // }
        // else {
        //     res.status(401).json('Mot de passe incorrect');
        // }
    }
    else {
        res.status(401).json({ message: 'Email incorrect' });
    };
};
