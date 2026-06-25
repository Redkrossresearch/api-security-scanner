const reportStyles = `
<style>

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body{
  background:#040B18;
  color:white;
  font-family:Inter,Segoe UI,sans-serif;
}

.page{
  width:100%;
  min-height:1120px;
  padding:35px;
  background:
    radial-gradient(circle at top right,#5B21B620,transparent 40%),
    radial-gradient(circle at bottom left,#2563EB20,transparent 40%),
    #040B18;
}

.cover-header{
  text-align:center;
  margin-top:40px;
}

.logo{
  font-size:64px;
  font-weight:900;
  letter-spacing:12px;
  text-transform:uppercase;

  text-shadow:
    0 0 20px rgba(255,255,255,.15),
    0 0 50px rgba(59,130,246,.15);
}

.logo span{
  color:#FF5A1F;
}

.subtitle{
  margin-top:15px;
  color:#A855F7;
  font-size:22px;
  letter-spacing:4px;
  text-transform:uppercase;
}

.hero-card{
  margin-top:40px;

  border-radius:28px;

padding:30px;

  border:1px solid rgba(239,68,68,.25);

  background:
  linear-gradient(
    135deg,
    rgba(8,17,31,.98),
    rgba(15,23,42,.95)
  );

  box-shadow:
    0 0 60px rgba(239,68,68,.08),
    inset 0 0 40px rgba(255,255,255,.02);
}

.hero-title{
  font-size:52px;
  font-weight:800;
  line-height:1.05;
  letter-spacing:-1.5px;
}

.hero-description{
  margin-top:20px;
  color:#CBD5E1;
  font-size:18px;
  line-height:1.8;
}

.metrics{
  margin-top:60px;
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:25px;
}

.metric-card{
  flex:1;

  padding:30px;

  border-radius:20px;

  background:
    linear-gradient(
      180deg,
      rgba(8,17,31,.95),
      rgba(15,23,42,.95)
    );

  border:1px solid rgba(255,255,255,.06);

  box-shadow:
    0 0 25px rgba(59,130,246,.08);
}

.metric-label{
  color:#94A3B8;
  font-size:12px;
  font-weight:600;
  letter-spacing:1px;
  text-transform:uppercase;
  margin-bottom:12px;
}

.metric-value{
  font-size:36px;
  font-weight:800;
  letter-spacing:-1px;
}

.critical{
  color:#EF4444;
}

.high{
  color:#F97316;
}

.medium{
  color:#EAB308;
}

.low{
  color:#3B82F6;
}

.meta-section{
  margin-top:30px;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:25px;
}

.meta-card{
  padding:20px;
  border-radius:16px;
  background:#08111F;
  border:1px solid rgba(255,255,255,.08);
}

.meta-title{
  color:#94A3B8;
  font-size:13px;
}

.meta-value{
  margin-top:8px;
  font-size:22px;
}

.confidential{
  margin-top:30px;
  border-radius:20px;
  padding:25px;
  border:1px solid rgba(168,85,247,.3);
  background:rgba(168,85,247,.05);
}

.confidential-title{
  color:#A855F7;
  font-size:22px;
  font-weight:700;
}

.confidential-text{
  margin-top:10px;
  color:#CBD5E1;
}

.page-break{
  page-break-after:always;
}

.report-page{

  padding:60px;

  background:
    radial-gradient(circle at top right,#5B21B620,transparent 40%),
    radial-gradient(circle at bottom left,#2563EB20,transparent 40%),
    #040B18;

  color:white;

}

.report-page h1{
  margin-top:50px;
  margin-bottom:20px;

  color:#A855F7;

  font-size:32px;

  font-weight:800;

  letter-spacing:-0.8px;

  border-left:4px solid #A855F7;

  padding-left:18px;
}

.report-page p{
  font-size:16px;
  font-weight:500;
  line-height:2;
  letter-spacing:0.1px;
  color:#CBD5E1;
  white-space:pre-wrap;
}

.footer{

  margin-top:60px;

  padding-top:15px;

  border-top:1px solid #A855F7;

  display:flex;

  justify-content:space-between;

  align-items:center;

  color:#94A3B8;

  font-size:12px;

  font-weight:600;

  letter-spacing:.5px;

}

.report-content{

  color:#CBD5E1;

  font-size:16px;

  line-height:1.9;

}

.report-content ul{
  margin-left:25px;
  margin-top:12px;
}

.report-content li{
  margin-bottom:10px;
}

.report-content strong{
  color:#FFFFFF;
}

.report-content h1,
.report-content h2,
.report-content h3,
.report-content h4{

  color:#A855F7;

  margin-top:25px;

  margin-bottom:15px;

}

.report-content table{

  width:100%;

  border-collapse:collapse;

  margin-top:20px;

}

.report-content td,
.report-content th{

  border:1px solid rgba(255,255,255,.15);

  padding:10px;

}

</style>
`;

module.exports = reportStyles;
