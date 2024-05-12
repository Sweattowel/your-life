import React from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  {path: "/", name: 'Home'},
  {path: "/Profile", name: 'Profile'},
  {path: "/Create", name: 'Create'},
  {path: "/Contact", name: 'Contact'}
]

export default function Navigation() {

  const location = useLocation()

  return (
    <section className="fixed h-full left-0 bottom-0 w-[10vw] bg-gradient-to-r from-HIGHLIGHTA to-HIGHLIGHTB">
      <h1 className="text-WHITE text-[2rem] font-serif w-full text-center">
        Your life
      </h1>
      <ul>
        {links.map((link, index) => (
          <li key={index}>
            <Link className={`${location.pathname === link.path ? `text-HIGHLIGHTA bg-WHITE` : 'text-WHITE bg-HIGHLIGHTA'} flex w-full justify-center`} to={`${link.path}`}>
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
