const Sauce = require("../models/Sauce");
const fs = require("fs");

//////////////////////////////////////////////////
// Création d'une sauce
//////////////////////////////////////////////////
exports.newSauce = (req, res, next) => {
  const sauceObj = JSON.parse(req.body.sauce);
  delete sauceObj._id;
  delete sauceObj._userId;

  const sauce = new Sauce({
    ...sauceObj,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
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

//////////////////////////////////////////////////
// Modification d'une sauce
//////////////////////////////////////////////////
exports.editSauce = (req, res, next) => {
  const sauceObj = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : {
        ...req.body,
      };
  delete sauceObj._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObj, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

//////////////////////////////////////////////////
// Suppression d'une sauce
//////////////////////////////////////////////////
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

//////////////////////////////////////////////////
// Obtention d'une sauce
//////////////////////////////////////////////////
exports.getSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

//////////////////////////////////////////////////
// Obtention de toutes les sauces
//////////////////////////////////////////////////
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

//////////////////////////////////////////////////
// Like d'une sauce
//////////////////////////////////////////////////
exports.likeSauce = (req, res, next) => {
  const sauceObj = req.body;

  switch (sauceObj.like) {
    case 1:
      //////////////////////////////////////////////////
      // Ajout d'un like
      //////////////////////////////////////////////////
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
      //////////////////////////////////////////////////
      // Ajout d'un dislike
      //////////////////////////////////////////////////
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
      //////////////////////////////////////////////////
      // Retrait d'un like/dislike
      //////////////////////////////////////////////////
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
