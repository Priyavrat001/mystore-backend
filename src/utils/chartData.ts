import { Document } from "mongoose";


interface MyDocument extends Document {
    createdAt: Date;
    discount?: number;
    total?: number;
}

type DataProps = {
    length: number;
    docArr: MyDocument[];
    today: Date;
    property?: "discount" | "total";
}

export const chartData = ({ length, docArr, today, property }: DataProps) => {

    const data = new Array(length).fill(0);

    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < length) {
            if (property) {

                data[length - monthDiff - 1] += i[property]!;
            }
            else {
                data[length - monthDiff - 1] += 1;

            }


        }
    });
    return data
}