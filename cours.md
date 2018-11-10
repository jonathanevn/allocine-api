const UserModel = mongoose.model( "User", {
name: String
});

const ProjectModel = mongoose.model( "Project", {
name: String,
members: [{
type: mongoose.Schema.types.ObjectId,
ref: "User";
}
]
});

//j'ai plusieurs membres
const laurent = new UserModel({
name: "Ulrick",
})

//je créé un modele projet
const backPriceProject = new ProjectModel({
name: "BackPrice"
});
