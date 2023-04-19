const Sequelize = require('sequelize');
const { STRING, BOOLEAN } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_products_search_db');
const jwt = require('jsonwebtoken');

const Product = conn.define('product', {
  name: {
    type: STRING
  },
  inStock: {
    type: BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

const User = conn.define('user', {
  username: {
    type: STRING,
    unique: true
  },
  password: {
    type: STRING
  },
});

User.prototype.generateToken = function(){
  return {
    token: jwt.sign({ id: this.id }, process.env.JWT) 
  };
}

User.register = async function(credentials){
  const user = await this.create(credentials);
  return user.generateToken();
}

User.authenticate = async function(credentials){
  const { username, password } = credentials;
  const user = await this.findOne({
    where: {
      username,
      password
    }
  });
  if(!user){
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
  return user.generateToken();
}

module.exports = {
  Product,
  User,
  conn
};
