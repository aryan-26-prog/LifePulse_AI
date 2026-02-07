exports.calculateXP = ({ hoursWorked, peopleHelped, imagesCount }) => {

  let xp = 100;

  xp += (hoursWorked || 0) * 5;
  xp += (peopleHelped || 0) * 2;

  if (imagesCount > 0) xp += 20;

  return xp;
};


exports.calculateLevel = (xp) => {

  if (xp >= 1500) return "Legend";
  if (xp >= 900) return "Hero";
  if (xp >= 500) return "Guardian";
  if (xp >= 200) return "Helper";

  return "Rookie";
};
