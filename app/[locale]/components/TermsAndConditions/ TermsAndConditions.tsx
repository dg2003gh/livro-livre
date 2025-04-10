import { useRef } from "react";
import Modal from "../Modal/Modal";
import { useTranslations } from "next-intl";

export default function TermsAndConditions() {
  const termsButtonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("TermsAndConditions");

  return (
    <>
      <button ref={termsButtonRef}>
        <a>{t("title")}</a>
      </button>
      <Modal title={t("title")} openButtonRef={termsButtonRef}>
        <div className="md:p-8 space-y-5 link">
          <p className="text-lg">
            <span
              dangerouslySetInnerHTML={{
                __html: t.raw("intro"),
              }}
            />
          </p>
          <div className="space-y-6">
            {[
              "AccountsAndMembership",
              "UserContent",
              "Backups",
              "LinksToOtherResources",
              "ProhibitedUses",
              "IntellectualPropertyRights",
              "Indemnification",
              "Severability",
              "DisputeResolution",
              "ChangesAndAmendments",
              "AcceptanceOfTheseTerms",
            ].map((section) => (
              <section key={section} className="space-y-4 link">
                <h2 className="text-2xl font-semibold">
                  {t(`${section}.title`)}
                </h2>
                <p>{t(`${section}.content`)}</p>
              </section>
            ))}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">
                {t("ContactingUs.title")}
              </h2>
              <p>
                <div>{t("ContactingUs.content")}</div>
                <a className="text-blue-400" href="mailto:contact@finituz.com">
                  contact@finituz.com
                </a>
              </p>
            </section>

            <p className="text-sm text-gray-400">{t("LastUpdated")}</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
