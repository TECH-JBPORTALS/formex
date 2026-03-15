export interface VisionMission {
  institutionName: string;
  code: string;
  vision: string;
  mission: string;
}

export function Format01({ data }: { data: VisionMission }) {
  return (
    <div className="p-10 w-[210mm] shadow-sm bg-white min-h-[297mm]">
      <h1 className="text-center font-bold">GOVERNMENT OF KARNATAKA</h1>

      <h2 className="text-center">Vision and Mission of the Institute</h2>

      <div className="mt-6">
        <p>
          <b>Institution Name:</b> {data.institutionName}
        </p>
        <p>
          <b>Institution Code:</b> {data.code}
        </p>
      </div>

      <div className="mt-6">
        <p>
          <b>Vision:</b>
        </p>
        <p>{data.vision}</p>
      </div>

      <div className="mt-6">
        <p>
          <b>Mission:</b>
        </p>
        <p>{data.mission}</p>
      </div>

      <div className="mt-20 text-right">Signature of Principal</div>
    </div>
  );
}
