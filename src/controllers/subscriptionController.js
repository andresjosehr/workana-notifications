
const db = require('../database/index');
const {query} = require('../database/index');

const subscribe = async (req, res) => {
  let subscription = await query("SELECT * FROM machine_keys WHERE machine_key=? AND subscription=?", [req.body.machineKey, JSON.stringify(req.body.subscription)])

  if(subscription.length > 0) {
    return res.status(200).json({message: "Ya existe la subscripción"});
  }

  subscription = await query("SELECT * FROM machine_keys WHERE machine_key=?", [req.body.machineKey]);

  if(subscription.length > 0) {
    await query("UPDATE machine_keys SET subscription=? WHERE machine_key=?", [JSON.stringify(req.body.subscription), req.body.machineKey]);
    return  res.status(200).json({message: "Subscripción actualizada"});
  }

  await query("INSERT INTO machine_keys (machine_key, subscription) VALUES (?, ?)", [req.body.machineKey, JSON.stringify(req.body.subscription)]);
  res.status(200).json({message: "Subscripción creada"});
}

const getPublicVapidKey = async (req, res) => {
  const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
  res.status(200).json({publicVapidKey});
}

module.exports = {
  subscribe,
  getPublicVapidKey
}