exports.generateBadges = (completedCamps) => {

  const badges = [];

  if (completedCamps >= 1) {
    badges.push({
      name: "First Responder",
      icon: "🥇",
      description: "Completed first relief mission"
    });
  }

  if (completedCamps >= 3) {
    badges.push({
      name: "Community Hero",
      icon: "🏅",
      description: "Completed 3 relief missions"
    });
  }

  if (completedCamps >= 5) {
    badges.push({
      name: "Disaster Warrior",
      icon: "🔥",
      description: "Completed 5 relief missions"
    });
  }

  if (completedCamps >= 10) {
    badges.push({
      name: "LifePulse Champion",
      icon: "🌟",
      description: "Completed 10 relief missions"
    });
  }

  return badges;
};
