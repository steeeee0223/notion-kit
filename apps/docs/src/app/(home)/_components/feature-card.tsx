/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface Feature {
  title: string;
  desc: string;
  img: string;
  icon: React.ReactNode;
  link?: {
    href: string;
    label: string;
  };
}

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-input p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="pb-4">
        <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-blue/10 p-2 text-blue [&_svg]:size-5">
          {feature.icon}
        </div>
        <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
        <p className="text-secondary">{feature.desc}</p>
        {feature.link && (
          <Link
            href={feature.link.href}
            className="group inline-flex items-center font-semibold text-blue underline underline-offset-4 hover:text-red"
          >
            {feature.link.label}{" "}
            <ArrowRight className="ml-1 size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        )}
      </div>
      <div className="mt-auto translate-8">
        <div className="overflow-hidden rounded-lg border border-border shadow-sm">
          <img
            src={feature.img}
            alt={feature.title}
            className="w-full object-cover transition-transform hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
}
