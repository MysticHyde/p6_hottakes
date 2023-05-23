const Sauce = require("../models/Sauce");
const fs = require("fs");

// CREATION //
exports.newSauce = (req, res, next) => {
  const reqObj = JSON.parse(req.body.sauce);
  delete reqObj.userId;

  const sauce = new Sauce({
    ...reqObj,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
      }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Sauce enregistrée !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// MODIFICATION //
exports.editSauce = (req, res, next) => {

  const reqObj = req.file
    ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    }
    : {
      ...req.body,
    };

  delete reqObj._userId;

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        if (req.file) {
          const filename = sauce.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
            Sauce.updateOne(
              { _id: req.params.id },
              { ...reqObj, _id: req.params.id }
            )
              .then(() => res.status(200).json({ message: "Sauce modifiée  avec nouvelle image !" }))
              .catch((error) => res.status(401).json({ error }));
          });
        } else {
          Sauce.updateOne(
            { _id: req.params.id },
            { ...reqObj, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
            .catch((error) => res.status(401).json({ error }));

        }

      }
    })
    .catch((error) => res.status(400).json({ error }));
};




// SUPPRESSION //
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};




// OBTENIR UNE SAUCE //
exports.getSauce = (req, res, next) => {
  let paramId = req.params.id;
  Sauce.findOne({ _id: paramId })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};




// OBTENIR TOUTES LES SAUCES //
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};




// LIKE / DISLIKE //
exports.likeSauce = (req, res, next) => {
  const sauceObj = req.body;

  switch (sauceObj.like) {
    case 1:
      // LIKE //
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
          $push: { usersLiked: sauceObj.userId },
        }
      )
        .then(() => res.status(200).json({ message: "Like ajouté !" }))
        .catch((error) => res.status(401).json({ error }));
      break;

    case -1:
      // DISLIKE //
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { dislikes: 1 },
          $push: { usersDisliked: sauceObj.userId },
        }
      )
        .then(() => res.status(200).json({ message: "Dislike ajouté !" }))
        .catch((error) => res.status(402).json({ error }));
      break;

    case 0:
      // RETRAIT DU LIKE / DISLIKE //
      Sauce.findOne({ _id: req.params.id }).then((sauce) => {
        console.log("id sauce = " + req.params.id);
        console.log("id user = " + sauceObj.userId);

        if (sauce.usersLiked.includes(sauceObj.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: sauceObj.userId },
            }
          )
            .then(() => res.status(200).json({ message: "Retrait du like !" }))
            .catch((error) => res.status(401).json({ error }));
        } else if (sauce.usersDisliked.includes(sauceObj.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: sauceObj.userId },
            }
          )
            .then(() =>
              res.status(200).json({ message: "Retrait du dislike !" })
            )
            .catch((error) => res.status(403).json({ error }));
        }
      });

      break;

    default:
      res.status(400).json({ message: "Valeur non autorisé" });
      break;
  }
};
