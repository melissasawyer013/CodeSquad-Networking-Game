const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false, 
    useCreateIndex: true }, 
    (err) => {
      if(err) {
        console.log(`Error with MongoDB's connectiviy is: ${err}`);
      }
      else {  
        console.log(`Successfully connected to MongoDB server. Look at you go.`);  
      }
});