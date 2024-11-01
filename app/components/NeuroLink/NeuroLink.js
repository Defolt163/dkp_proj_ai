'use client'
import React, { useEffect, useState } from 'react';
import * as Tesseract from 'tesseract.js'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import './style.sass'



export default function NeuroLink() {
    const [imageFile, setImageFile] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]); // Сохраняем выбранный файл
    };

    // сжатие
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target.result;
            };

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const MAX_WIDTH = 1000; // Максимальная ширина
                const MAX_HEIGHT = 1000; // Максимальная высота
                let width = img.width;
                let height = img.height;

                // Рассчет новой ширины и высоты
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const quality = 0.7; // Настройка качества сжатия
                const dataUrl = canvas.toDataURL('image/jpeg', quality);

                // Преобразование data URL в Blob
                fetch(dataUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    })
                    .catch(err => reject(err));
            };

            img.onerror = (err) => {
                reject(err);
            };

            reader.readAsDataURL(file);
        });
    };
    // Отправка
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const formData = new FormData();
        const compressedFile = await compressImage(imageFile)
        formData.append('file', compressedFile);
        formData.append('apikey', 'K87560169088957');
        formData.append('language', 'eng');
        formData.append('isCreateSearchablePdf', true);
        formData.append('isSearchablePdfHideTextLayer', true);
        formData.append('OCREngine', 2);
    
        const fileType = imageFile.name.split('.').pop();
        formData.append('filetype', fileType);

        console.log("START")
    
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData,
        });
    
        if (!response.ok) {
            throw new Error('Ошибка при получении результатов OCR');
        }
    
            const ocrResult = await response.json();
            console.log(ocrResult);
            setResult(ocrResult.ParsedResults[0].ParsedText);
        } catch (err) {
            setError('Произошла ошибка');
        }
    };
  
    useEffect(()=>{
        console.log("LOGI", result)
    }, [result])


    const [vehicleInfoCard, setVehicleInfoCard] = useState({
        VIN: '',
        mark: '',
        color: '',
        plate: '',
        stsNumber: '',
        year: ''
      });
    
      const handleInputChange = (e) => {
        const { id, value } = e.target;
        setVehicleInfoCard((prevInfo) => ({
          ...prevInfo,
          [id]: value,
        }));
      }

    const inputText = `
Регистрационный знак B276BA150
Идентификационный номер (VIN)
УЗМ54323070029117
Марка, модель
МАЗ 54323-032
Тип ТС
MAZ 54323-032
Категория
ТАРС (АСЬ, прицену»
C
Год выпуска ТС 2000
Шасси Nº Y3M54323070029117
Кузов Nº КАБ. 13697
Цвет СЕРЫЙ
Мощность двигателя, кВт/л. с. 243,00
Экологический класс
Нет данных
Паспорт ТС серия50НУ N959655
Разрешенная тах масса, kq 16500
Масса без нагрузки, kg 6000
`;
const [vehicleInfo, setVehicleInfo] = useState('')
function parseVehicleInfo(text) {
    const result = {};

    result.VIN = text.match(/\b[A-Z0-9]{17}\b/i)?.[0] || '';
    result['plate'] = text.match(/([A-Z]{1}\d{3}[A-Z]{2}\d{2,3})/i)?.[0] || '';
    result['mark'] = text.match(/Марка,\s*модель\s*:\s*([А-ЯA-Z\s\d-]+)/i)?.[1]?.replace(/\s+/g, ' ').trim() || '';
    if (!result['mark']) {
        result['mark'] = text.match(/Марка\s*модель\s*:\s*([А-ЯA-Z\s\d-]+)/i)?.[1]?.replace(/\s+/g, ' ').trim() || '';
    }
    if (!result['mark']) {
        result['mark'] = text.match(/Марка,\s*модель\s*([А-ЯA-Z\s\d-]+)/i)?.[1]?.replace(/\s+/g, ' ').trim() || '';
    }
    if (!result['mark']) {
        result['mark'] = text.match(/Марка\s*модель\s*([А-ЯA-Z0-9\s-]+)(?:\s+Категория|$)/i)?.[1]?.trim() || '';
    }
    result['type'] = text.match(/Категория ТС\s+\(.*?\)\s+([A-Z\/0-9]+)/i)?.[1] || '';
    result['year'] = text.match(/Год выпуска ТС\s+(\d{4})/i)?.[1] || '';
    result['color'] = text.match(/Цвет\s+([А-Я]+)/i)?.[1] || '';
    result['stsNumber'] = text.match(/(\d{2}\s\d{2}\s\d{6})/i)?.[1] || '';

    return result;
}

useEffect(()=>{
    setVehicleInfo(parseVehicleInfo(inputText))
}, [inputText])

useEffect(()=>{
    console.log(vehicleInfo)
    setVehicleInfoCard({
        VIN: vehicleInfo.VIN,
        mark: vehicleInfo.mark,
        color: vehicleInfo.color,
        plate: vehicleInfo.plate,
        stsNumber: vehicleInfo.stsNumber,
        year: vehicleInfo.year 
    })
}, [vehicleInfo])

useEffect(()=>{
    console.log(vehicleInfoCard)
}, [vehicleInfoCard])


    const [step, setStep] = useState(1)
    const renderStepContent = () => {
        switch(step){
            case 0:
                return(
                    <div className='data-type_block'>
                        <div className='data-type' onClick={()=>{setStep(1)}}>
                            <div className='data-image'></div>
                            <div className='data-header'>
                                Распознавание VIN по фото
                            </div>
                        </div>
                        <div className='data-type' onClick={()=>{setStep(2)}}>
                            <div className='data-image'></div>
                            <div className='data-header'>
                                Заполнить вручную
                            </div>
                        </div>
                    </div>
                )
            case 1:
                return(
                    <div style={{ padding: '20px' }}>
                        <h1>Оптическое распознавание текста</h1>
                        <div>
                            <form onSubmit={handleSubmit}>
                            <input type="file" onChange={handleFileChange} accept="image/*" required />
                            <button type="submit">Отправить</button>
                            </form>
                            {JSON.stringify(vehicleInfo, null, 2)}
                        </div>
                        <div onClick={()=>{setStep(2)}}>CLICK</div>
                    </div>
                )
            case 2:
                return(
                    <div className='input-block'>
                        <form>
                            <h2>Данные автомобиля</h2>
                            <div className='vehicle-info'>
                                <Label htmlFor='vin'>VIN</Label>
                                <Input required id='vin' value={vehicleInfoCard.VIN} onChange={handleInputChange} />

                                <Label htmlFor='plate'>Гос-Номер</Label>
                                <Input required id='plate' value={vehicleInfoCard.plate} onChange={handleInputChange} />

                                <Label htmlFor='mark'>Марка, Модель</Label>
                                <Input required id='mark' value={vehicleInfoCard.mark} onChange={handleInputChange}/>

                                <Label htmlFor='mark'>Год</Label>
                                <Input required id='mark' value={vehicleInfoCard.year} onChange={handleInputChange}/>

                                <Label htmlFor='type'>Тип ТС</Label>
                                <Input required id='type'/>
                                <div className='two-input-block'>
                                    <div className='two-input-block_item'>
                                        <Label htmlFor='engineNum'>Номер двигателя</Label>
                                        <Input id='engineNum'/>
                                    </div>
                                    <div className='two-input-block_item'>
                                        <Label htmlFor='engineModel'>Модель двигателя</Label>
                                        <Input id='engineModel'/>
                                    </div>
                                    <div className='two-input-block_item'>
                                        <Label htmlFor='engineSquare'>Объем</Label>
                                        <Input type="number" required id='engineSquare'/>
                                    </div>
                                    <div className='two-input-block_item'>
                                        <Label htmlFor='enginePower'>Мощность</Label>
                                        <Input type="number" required id='enginePower'/>
                                    </div>
                                </div>
                                <Label htmlFor='bodyNum'>Номер кузова</Label>
                                <Input id='bodyNum'/>

                                <Label htmlFor='bodyColor'>Цвет кузова</Label>
                                <Input required id='bodyColor'/>
                                <h3>ПТС</h3>
                                <div className='pts-info'>
                                    <div className='partnumber-block'>
                                        <div className='flex'>
                                            <div className='partnumber-block_item'>
                                                <Label htmlFor='ptsPart'>Серия</Label>
                                                <Input type="number" required id='ptsPart'/>
                                            </div>
                                            <div className='partnumber-block_item'>
                                                <Label htmlFor='ptsNum'>Номер</Label>
                                                <Input type="number" required id='ptsNum'/>
                                            </div>
                                        </div>
                                        <div className='partnumber-block_item'>
                                            <Label htmlFor='ptsDate'>Когда выдан</Label>
                                            <Input type="number" required id='ptsDate'/>
                                        </div>
                                    </div>

                                    <Label htmlFor='ptsWho'>Кем выдан</Label>
                                    <Textarea required id='ptsWho'/>
                                </div>
                                <h3>СТС</h3>
                                <div className='sts-info'>
                                    <div className='partnumber-block'>
                                        <div className='flex'>
                                            <div className='partnumber-block_item'>
                                                <Label htmlFor='stsPart'>Серия</Label>
                                                <Input type="number" required id='stsPart' value={vehicleInfoCard.stsNumber} onChange={handleInputChange}/>
                                            </div>
                                            <div className='partnumber-block_item'>
                                                <Label htmlFor='stsNum'>Номер</Label>
                                                <Input type="number" required id='stsNum'/>
                                            </div>
                                        </div>
                                        <div className='partnumber-block_item'>
                                            <Label htmlFor='stsDate'>Когда выдан</Label>
                                            <Input type="number" required id='stsDate'/>
                                        </div>
                                    </div>
                                    <Label htmlFor='stsWho'>Кем выдан</Label>
                                    <Textarea required id='stsWho'/>
                                </div>
                            </div>
                            <h2>Данные Покупателя</h2>
                            <div className='user-info'>
                                <div className='two-input-block'>
                                    <div className='partnumber-block_item w80p'>
                                        <Label htmlFor='userInfo'>ФИО</Label>
                                        <Input required id='userInfo'/>
                                    </div>
                                    <div className='partnumber-block_item other-w'>
                                        <Label htmlFor='userBirthday'>Дата рождения</Label>
                                        <Input type="number" required id='userBirthday'/>
                                    </div>
                                </div>
                                    <div className='partnumber-block'>
                                        <div className='flex'>
                                            <div className='partnumber-block_item'>
                                                <Label htmlFor='userPart'>Серия</Label>
                                                <Input type="number" required id='userPart'/>
                                            </div>
                                            <div className='partnumber-block_item'>
                                                <Label htmlFor='userNum'>Номер</Label>
                                                <Input type="number" required id='userNum'/>
                                            </div>
                                        </div>
                                        <div className='partnumber-block_item'>
                                            <Label htmlFor='userDate'>Когда выдан</Label>
                                            <Input type="number" required id='userDate'/>
                                        </div>
                                    </div>
                                    <Label htmlFor='passportWho'>Кем выдан</Label>
                                    <Textarea required id='passportWho'/>
                            </div>
                            <h2>Данные Продавца</h2>
                            <div className='user-info'>
                                <div className='two-input-block'>
                                    <div className='partnumber-block_item w80p'>
                                        <Label htmlFor='salerInfo'>ФИО</Label>
                                        <Input required id='salerInfo'/>
                                    </div>
                                    <div className='partnumber-block_item other-w'>
                                        <Label htmlFor='salerBirthday'>Дата рождения</Label>
                                        <Input type="number" required id='salerBirthday'/>
                                    </div>
                                </div>
                                    <div className='partnumber-block'>
                                        <div className='flex'>
                                            <div className='partnumber-block_item'>
                                                <Label htmlFor='salerPart'>Серия</Label>
                                                <Input type="number" required id='salerPart'/>
                                            </div>
                                            <div className='partnumber-block_item'>
                                                <Label htmlFor='salerNum'>Номер</Label>
                                                <Input type="number" required id='salerNum'/>
                                            </div>
                                        </div>
                                        <div className='partnumber-block_item'>
                                            <Label htmlFor='salerDate'>Когда выдан</Label>
                                            <Input type="number" required id='salerDate'/>
                                        </div>
                                    </div>
                                    <Label htmlFor='passportSalerWho'>Кем выдан</Label>
                                    <Textarea required id='passportSalerWho'/>
                            </div>
                        </form>
                    </div>
                )
        }
    }

    return (
        <div style={{ padding: '20px' }}>
            {renderStepContent()}
        </div>
    );
}
