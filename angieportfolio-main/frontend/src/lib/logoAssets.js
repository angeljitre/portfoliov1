export const softwareLogoMap = {
  ZBrush: '/assets/software-logos/zbrush.png',
  Maya: '/assets/software-logos/maya.png',
  'Marvelous Designer': '/assets/software-logos/marvel.png',
  'Substance 3D Painter': '/assets/software-logos/substance.png',
  Blender: '/assets/software-logos/blender.png',
  Canva: '/assets/software-logos/canva.png',
  Figma: '/assets/software-logos/figma.png',
  'Adobe Creative Cloud': '/assets/software-logos/ac.png',
  CapCut: '/assets/software-logos/capcut.png',
  ChatGPT: '/assets/software-logos/chat.png',
  Gemini: '/assets/software-logos/gem.png',
  Claude: '/assets/software-logos/claude.png',
};

export const getSoftwareLogo = (name) => softwareLogoMap[name] || null;

export const getProjectLogo = (id, theme = 'dark') => {
  const suffix = theme === 'light' ? 'b' : 'w';
  const map = {
    chulel: `/assets/project-logos/chulel${suffix}.png`,
    bashequen: `/assets/project-logos/bashequen${suffix}.png`,
    navituxtla: `/assets/project-logos/nav${suffix}.png`,
    unach: `/assets/project-logos/unach${suffix}.png`,
  };
  return map[id] || null;
};
