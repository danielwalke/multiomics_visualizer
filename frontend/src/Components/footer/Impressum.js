import React from "react";
import "./Glass.css"
export const Impressum = () => {
    return(
        <div style={{height:"100%", overflowY:"auto", width:"100%", display:"flex", justifyContent:"center", padding:"1rem"}}>
            <div style={{padding:".75rem", width: "80%", minHeight:"100%", textAlign:"justify"}} className={"glass"}>
                <h2>Impressum</h2>
                <div>

                    Die nachstehenden Informationen enthalten die gesetzlich vorgesehenen Pflichtangaben zur Anbieterkennzeichnung sowie wichtige rechtliche Hinweise zur Internetpräsenz des Leibniz-Instituts für Analytische Wissenschaften - ISAS - e.V. (www.isas.de).

                    <h3>Anbieter</h3>
                    Der Anbieter dieser Internetpräsenz im Rechtssinne ist das Leibniz-Institut für Analytische Wissenschaften - ISAS - e.V.

                    <h3>Adresse</h3>
                    Leibniz-Institut für Analytische Wissenschaften - ISAS - e.V.<br/>
                    Bunsen-Kirchhoff-Str. 11<br/>
                    D-44139 Dortmund<br/>

                    <h3>Rechtsträger</h3>
                    Leibniz-Institut für Analytische Wissenschaften - ISAS - e.V., Bunsen-Kirchhoff-Str. 11, 44139 Dortmund<br/>

                    Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: DE 124913007<br/>

                    <h3>Geschäftsführer</h3>
                    Das Leibniz-Institut für Analytische Wissenschaften - ISAS - e.V. wird gesetzlich vertreten durch zwei Mitglieder des Vorstands.<br/>

                    <h3>Vorstand</h3>Prof. Dr. Albert Sickmann, Jürgen Bethke<br/>

                    <h3>Rechtsform</h3>
                    Eingetragener Verein (e.V.)<br/>
                </div>
            </div>
        </div>
    )
}
