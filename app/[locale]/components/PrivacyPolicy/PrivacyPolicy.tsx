import { useRef } from "react";
import Modal from "../Modal/Modal";
import { useTranslations } from "next-intl";

export default function PrivacyPolicy() {
  const privacyButtonRef = useRef(null);
  const t = useTranslations("PrivacyPolicy");

  return (
    <>
      <button ref={privacyButtonRef}>
        <a>Privacy policy</a>
      </button>
      <Modal openButtonRef={privacyButtonRef}>
        <div className="space-y-8">
          <h1 className="text-4xl font-semibold">{t("title")}</h1>
          <section className="space-y-4">
            <p>{t("intro")}</p>
            <p
              dangerouslySetInnerHTML={{
                __html: t.raw("intro2"),
              }}
            />
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              {t("InterpretationAndDefinitions.title")}
            </h2>

            <div>
              <h3 className="text-xl font-semibold">
                {t("InterpretationAndDefinitions.Interpretation.title")}
              </h3>
              <p>{t("InterpretationAndDefinitions.Interpretation.content")}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold">
                {t("InterpretationAndDefinitions.Definitions.title")}
              </h3>
              <p>{t("InterpretationAndDefinitions.Definitions.content")}</p>

              {[
                "Account",
                "Affiliate",
                "Company",
                "Cookies",
                "Country",
                "Device",
                "PersonalData",
                "Service",
                "ServiceProvider",
                "UsageData",
                "Website",
                "You",
              ].map((value, index) => (
                <p key={index}>
                  <span className="font-semibold">{value}: </span>
                  {t(`InterpretationAndDefinitions.Definitions.items.${value}`)}
                </p>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              {t("CollectingAndUsingData.title")}
            </h2>

            <div>
              <h3 className="text-xl font-semibold">
                {t("CollectingAndUsingData.TypesOfData.title")}
              </h3>

              <div>
                <h4 className="font-semibold">
                  {t("CollectingAndUsingData.TypesOfData.PersonalData.title")}
                </h4>
                <p>
                  {t("CollectingAndUsingData.TypesOfData.PersonalData.content")}
                </p>
                <ul className="list-disc pl-5">
                  {["EmailAddress", "Name", "UsageData"].map((key, index) => (
                    <li key={index}>
                      {t(
                        `CollectingAndUsingData.TypesOfData.PersonalData.items.${key}`,
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold">
                  {t("CollectingAndUsingData.TypesOfData.UsageData.title")}
                </h4>
                <p>
                  {t("CollectingAndUsingData.TypesOfData.UsageData.content")}
                </p>
                <ul className="list-disc pl-5">
                  {["Detail1", "Detail2", "Detail3"].map((key, index) => (
                    <li key={index}>
                      {t(
                        `CollectingAndUsingData.TypesOfData.UsageData.details.${key}`,
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold">
                  {t(
                    "CollectingAndUsingData.TypesOfData.TrackingTechnologies.title",
                  )}
                </h4>
                <p>
                  {t(
                    "CollectingAndUsingData.TypesOfData.TrackingTechnologies.content",
                  )}
                </p>

                <div>
                  <h5 className="font-medium">
                    {t(
                      "CollectingAndUsingData.TypesOfData.TrackingTechnologies.items.Cookies.title",
                    )}
                  </h5>
                  <p>
                    {t(
                      "CollectingAndUsingData.TypesOfData.TrackingTechnologies.items.Cookies.content",
                    )}
                  </p>
                </div>

                <div>
                  <h5 className="font-medium">
                    {t(
                      "CollectingAndUsingData.TypesOfData.TrackingTechnologies.items.WebBeacons.title",
                    )}
                  </h5>
                  <p>
                    {t(
                      "CollectingAndUsingData.TypesOfData.TrackingTechnologies.items.WebBeacons.content",
                    )}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-400">{t("lastUpdated")}</p>
          </section>
        </div>
      </Modal>
    </>
  );
}
