import type { IconType } from "react-icons";
import {
  SiPython,
  SiDart,
  SiTypescript,
  SiJavascript,
  SiFlutter,
  SiVuedotjs,
  SiReact,
  SiSpringboot,
  SiFastapi,
  SiSqlalchemy,
  SiDjango,
  SiNodedotjs,
  SiRedis,
  SiMysql,
  SiPostgresql,
  SiWebrtc,
  SiDocker,
  SiJenkins,
  SiNginx,
  SiCaddy,
  SiNvidia,
  SiRos,
  SiRaspberrypi,
  SiGit,
  SiGitlab,
  SiFigma,
  SiJira,
  SiMattermost,
  SiNotion,
} from "react-icons/si";
import { FaJava } from "react-icons/fa6";
import { LuRadioTower, LuBrain, LuPackage } from "react-icons/lu";

/**
 * Maps a tech name (as used in tech-stack.ts and ProjectMeta.techStack) to a
 * react-icons component. Names with no dedicated brand icon fall back to a
 * generic Lucide icon. Unknown names render the LuPackage placeholder.
 */
export const techIcons: Record<string, IconType> = {
  // Languages
  Python: SiPython,
  Dart: SiDart,
  Java: FaJava,
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,

  // Frontend & Mobile
  Flutter: SiFlutter,
  "Vue.js": SiVuedotjs,
  React: SiReact,

  // Backend
  "Spring Boot": SiSpringboot,
  FastAPI: SiFastapi,
  SQLAlchemy: SiSqlalchemy,
  Django: SiDjango,
  "Django REST Framework": SiDjango,
  "Node.js": SiNodedotjs,

  // Realtime · Data
  WebSocket: LuRadioTower,
  WebRTC: SiWebrtc,
  Redis: SiRedis,
  MySQL: SiMysql,
  PostgreSQL: SiPostgresql,

  // Infra & DevOps
  Docker: SiDocker,
  Jenkins: SiJenkins,
  Nginx: SiNginx,
  Caddy: SiCaddy,

  // Sim · AI · Embedded
  "Isaac Lab": SiNvidia,
  "Reinforcement Learning": LuBrain,
  RL: LuBrain,
  ROS: SiRos,
  "Raspberry Pi": SiRaspberrypi,

  // External APIs
  "TMDB API": LuPackage,

  // Tools
  Git: SiGit,
  GitLab: SiGitlab,
  Figma: SiFigma,
  Jira: SiJira,
  Mattermost: SiMattermost,
  Notion: SiNotion,
};

/**
 * Brand color overrides — only set for icons where the brand identity
 * adds value at a glance. Anything not in this map uses currentColor
 * (i.e. matches the surrounding text tone). Kept conservative so the
 * Tech Stack section stays unified rather than busy.
 */
export const techBrandColors: Record<string, string> = {
  Python: "#3776AB",
  Dart: "#0175C2",
  TypeScript: "#3178C6",
  Flutter: "#02569B",
  "Vue.js": "#4FC08D",
  React: "#61DAFB",
  "Spring Boot": "#6DB33F",
  FastAPI: "#009688",
  SQLAlchemy: "#D71F00",
  Django: "#092E20",
  "Django REST Framework": "#A30000",
  "Node.js": "#5FA04E",
  Redis: "#FF4438",
  MySQL: "#4479A1",
  PostgreSQL: "#4169E1",
  Docker: "#2496ED",
  Jenkins: "#D24939",
  Nginx: "#009639",
  Caddy: "#1F88C0",
  "Isaac Lab": "#76B900",
  ROS: "#22314E",
  "Raspberry Pi": "#A22846",
  Git: "#F05032",
  GitLab: "#FC6D26",
  Figma: "#F24E1E",
  Jira: "#0052CC",
  Mattermost: "#0058CC",
};

export function getTechIcon(name: string): IconType {
  return techIcons[name] ?? LuPackage;
}
