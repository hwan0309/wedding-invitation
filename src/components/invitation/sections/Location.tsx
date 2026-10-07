"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconBus,
  IconCar,
  IconCopy,
  IconInfo,
  IconParking,
  IconPhone,
  IconPin,
  IconShuttle,
  IconSubway,
  IconTrain,
} from "@/components/icons";
import type { TransportType } from "@/lib/invitation/types";
import { hasKakaoKey, loadKakaoMaps, navigationLinks } from "@/lib/kakao";
import { copyText, useInvitation } from "../context";
import { Reveal, SectionTitle } from "../ui";

const TRANSPORT_ICONS: Record<TransportType, typeof IconBus> = {
  subway: IconSubway,
  bus: IconBus,
  car: IconCar,
  parking: IconParking,
  train: IconTrain,
  shuttle: IconShuttle,
  etc: IconInfo,
};

function VenueMap({ address, name, href }: { address: string; name: string; href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "failed">("idle");

  useEffect(() => {
    if (!hasKakaoKey() || !address || !ref.current) return;
    let cancelled = false;
    loadKakaoMaps()
      .then((maps) => {
        new maps.services.Geocoder().addressSearch(address, (result, code) => {
          if (cancelled || !ref.current) return;
          if (code !== maps.services.Status.OK || !result[0]) return setStatus("failed");
          const position = new maps.LatLng(Number(result[0].y), Number(result[0].x));
          const map = new maps.Map(ref.current, { center: position, level: 3 });
          new maps.Marker({ map, position });
          setStatus("ready");
        });
      })
      .catch(() => !cancelled && setStatus("failed"));
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (hasKakaoKey() && status !== "failed") {
    return <div ref={ref} className="inv-map" aria-label={`${name} 지도`} />;
  }
  // API 키가 없을 때: 지도 모양의 카드(누르면 카카오맵 검색으로 이동)
  return (
    <a className="inv-map inv-map--static" href={href} target="_blank" rel="noreferrer">
      <span className="inv-map__pin">
        <IconPin size={26} />
      </span>
      <span className="inv-map__label">{name || address}</span>
      <span className="inv-map__hint">눌러서 지도 보기</span>
    </a>
  );
}

export function Location() {
  const { data, toast } = useInvitation();
  const { venue, location } = data;
  const query = venue.address || venue.name;
  const links = navigationLinks(query);

  const openTmap = () => {
    if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      toast("티맵은 휴대폰에서 열 수 있어요.");
      return;
    }
    window.location.href = links.tmap;
  };

  return (
    <section className="inv-section inv-location">
      <Reveal>
        <SectionTitle en="Location" ko="오시는 길" />
        <p className="inv-location__name">
          {venue.name}
          {venue.hall && <span>{venue.hall}</span>}
        </p>
        {venue.address && (
          <p className="inv-location__addr">
            {venue.address}
            <button
              type="button"
              aria-label="주소 복사"
              onClick={async () => toast((await copyText(venue.address)) ? "주소를 복사했어요." : "복사하지 못했어요.")}
            >
              <IconCopy size={15} />
            </button>
          </p>
        )}
        {venue.tel && (
          <a className="inv-location__tel" href={`tel:${venue.tel.replace(/[^\d+]/g, "")}`}>
            <IconPhone size={14} /> {venue.tel}
          </a>
        )}
      </Reveal>

      {query && (
        <Reveal>
          <VenueMap address={venue.address} name={venue.name} href={links.kakao} />
          {location.showNavButtons && (
            <div className="inv-navs">
              <a href={links.kakao} target="_blank" rel="noreferrer">
                <i className="inv-navs__logo is-kakao" aria-hidden />
                카카오맵
              </a>
              <a href={links.naver} target="_blank" rel="noreferrer">
                <i className="inv-navs__logo is-naver" aria-hidden />
                네이버 지도
              </a>
              <button type="button" onClick={openTmap}>
                <i className="inv-navs__logo is-tmap" aria-hidden />
                티맵
              </button>
            </div>
          )}
        </Reveal>
      )}

      {location.transports.length > 0 && (
        <Reveal className="inv-transports">
          {location.transports.map((t) => {
            const Icon = TRANSPORT_ICONS[t.type];
            return (
              <div key={t.id} className="inv-transport">
                <span className="inv-transport__icon">
                  <Icon size={18} />
                </span>
                <div>
                  <strong>{t.title}</strong>
                  <p>{t.content}</p>
                </div>
              </div>
            );
          })}
        </Reveal>
      )}
    </section>
  );
}
